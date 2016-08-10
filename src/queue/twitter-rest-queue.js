
  /***************************************************************************/
  /* Augeo.io is a web application that uses Natural Language Processing to  */
  /* classify a user's internet activity into different 'skills'.            */
  /* Copyright (C) 2016 Brian Redd                                           */
  /*                                                                         */
  /* This program is free software: you can redistribute it and/or modify    */
  /* it under the terms of the GNU General Public License as published by    */
  /* the Free Software Foundation, either version 3 of the License, or       */
  /* (at your option) any later version.                                     */
  /*                                                                         */
  /* This program is distributed in the hope that it will be useful,         */
  /* but WITHOUT ANY WARRANTY; without even the implied warranty of          */
  /* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           */
  /* GNU General Public License for more details.                            */
  /*                                                                         */
  /* You should have received a copy of the GNU General Public License       */
  /* along with this program.  If not, see <http://www.gnu.org/licenses/>.   */
  /***************************************************************************/

  /***************************************************************************/
  /* Description: Queues to handle Twitter's rate limit                      */
  /***************************************************************************/

  // Required libraries
  var Async = require('../module/queue');
  var EventEmitter = require("events").EventEmitter;
  var Mongoose = require('mongoose');
  var Util = require("util");
  Util.inherits(TwitterRestQueue, EventEmitter);

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var Logger = require('../module/logger');
  var TwitterInterfaceService = require('../interface-service/twitter-interface-service');
  var TwitterService = require('../service/twitter-service');
  var UserService = require('../service/user-service');

  // Constants
  var CHECK_MENTION_QUEUE_OPEN_TIMEOUT = process.env.TEST === 'true' ? 100 : 10000;
  var CHECK_TWEET_QUEUE_OPEN_TIMEOUT = process.env.TEST === 'true' ? 100 : 1000;
  var MAX_MENTION_REQUEST = 4;
  var MAX_TWEET_REQUEST = 16;
  var MENTION_WINDOW = 15;
  var TWEET_WINDOW = 15;
  var MENTION_REQUESTS_PER_WINDOW = process.env.TEST === 'true' ? 3600 : 15;
  var MENTION_TIMEOUT = ((MENTION_WINDOW*60)/MENTION_REQUESTS_PER_WINDOW)*1000;
  var QUEUE = 'twitter-rest-queue';
  var TWEET_REQUESTS_PER_WINDOW = process.env.TEST === 'true' ? 3600 : 300;
  var TWEET_TIMEOUT = ((TWEET_WINDOW*60)/TWEET_REQUESTS_PER_WINDOW)*1000;

  // Global variables
  var log = new Logger();
  var self;

  // Constructor
  function TwitterRestQueue () {

    // Rest Queue is a singleton
    if (!TwitterRestQueue.restQueue) {
      this.init();
      TwitterRestQueue.restQueue = this;
    }

    return TwitterRestQueue.restQueue;
  }

  TwitterRestQueue.prototype.init = function init() {

    self = this;
    self.currentTweetUserId;
    self.currentMentionUserId;

    self.mentionRequestOpen = true;
    self.mentionMessenger;
    self.userMentionTweets;

    self.tweetRequestOpen = true;
    self.tweetMessenger;
    self.userTweets;

    // Queue to maintain Twitter's mention_timeline request rate limit
    self.mentionQueue = Async.queue(function(queueData, callback) {
      var logData = (queueData)?queueData.logData:{};
      log.functionCall(QUEUE, 'Async.queue (mention)', logData.parentProcess, logData.username, {'queueData.screenName':(queueData)?queueData.screenName:'invalid',
        'queueData.tweetId':(queueData)?queueData.tweetId:'invalid'}, 'Executing mention queue task');

      // Set current mention userId
      self.currentMentionUserId = queueData.userId;

      // Every queue task will retrieve a user's mentions
      onMentionRequestOpen(logData, function() {
        startMentionTimer(logData);
        getUserMentions(queueData, function() {
          if(!self.currentMentionUserId) {
            if(queueData.onFinish) {
              queueData.onFinish();
            }
          } else {
            if(queueData.onIteration) {
              queueData.onIteration(self.userMentionTweets);
            }
          }
          callback();
        });
      });
    }, 1); // Only allow 1 request at a time

    // Queue to maintain Twitter's user_timeline request rate limit
    self.tweetQueue = Async.queue(function(queueData, callback) {
      var logData = (queueData)?queueData.logData:{};
      log.functionCall(QUEUE, 'Async.queue (tweet)', logData.parentProcess, logData.username, {'queueData.screenName':(queueData)?queueData.screenName:'invalid',
        'queueData.tweetId':(queueData)?queueData.tweetId:'invalid'}, 'Executing tweet queue task');

      // Set current Tweet userId
      self.currentTweetUserId = queueData.userId;

      // Every queue task will retrieve a user's tweets
      onTweetRequestOpen(logData, function() {
        startTweetTimer(logData);
        getUserTweets(queueData, function() {
          if(!self.currentTweetUserId) {
            if(queueData.onFinish) {
              queueData.onFinish();
            }
          } else {
            if(queueData.onIteration) {
              queueData.onIteration(self.userTweets);
            }
          }
          callback();
        });
      });
    }, 1); // Only allow 1 request at a time
  };

  TwitterRestQueue.prototype.addAllUsersToQueues = function(queue, logData, callback) {
    log.functionCall(QUEUE, 'addAllUsersToQueues', logData.parentProcess, logData.username, {'queue':(queue)?'defined':'invalid'});

    TwitterService.getAllUsersQueueData(logData, function(users) {

      if(users.length > 0) {

        // Asynchronous method calls in loop - Using Recursion
        (function myClojure(i) {

          var user = users[i];

            TwitterService.getLatestTweetId(user.screenName, logData, function(tweetId) {

              TwitterService.getLatestMentionTweetId(user.screenName, logData, function(mentionTweetId) {

                // Create queue data for each user
                var queueData = {
                  userId: new Mongoose.Types.ObjectId(user.augeoUser),
                  screenName: user.screenName,
                  accessToken: user.accessToken,
                  secretAccessToken: user.secretAccessToken,
                  isNewUser: true
                };

                if(i == users.length - 1 || process.env.TEST == 'true') {
                  queueData.onFinish = function() {
                    callback();
                  }
                }

                if(process.env.TEST != 'true' || (process.env.TEST == 'true' && queueData.screenName == 'testScreenName')) {

                  if(queue == 'ALL' || queue == 'TWEET') {
                    if(tweetId){
                      queueData.minTweetId = tweetId;
                    }

                    // Add user to Tweet Queue
                    self.addUserToTweetQueue(queueData, logData);
                  }

                  if(queue == 'ALL' || queue == 'MENTION') {
                    if(mentionTweetId){
                      queueData.minMentionTweetId = mentionTweetId;
                    }

                    // Add user to Mention Queue
                    self.addUserToMentionQueue(queueData, logData);
                  }
                }

                i++;
                if(i < users.length) {
                  myClojure(i);
                }
              });
            });
        })(0); // Pass i as 0 and myArray to myClojure
      } else {
        callback();
      }
    });
  };

  // Function to add user to mention queue
  TwitterRestQueue.prototype.addUserToMentionQueue = function(userQueueData, logData) {
    log.functionCall(QUEUE, 'addUserToMentionQueue', logData.parentProcess, logData.username,
      {'userQueueData.screenName':(userQueueData)?userQueueData.screenName:'invalid'});

    var isAddRequestValid = true;
    var queueUserId = userQueueData.userId + '';
    if(queueUserId == self.currentMentionUserId) {
      isAddRequestValid = false;
    } else {

      // Verify user is not already in queue
      var tasks = self.mentionQueue.tasks;
      for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].data.userId == userQueueData.userId) {
          isAddRequestValid = false;
          break;
        }
      }
    }

    if(isAddRequestValid == true) {
      log.functionCall(QUEUE, 'addUserToMentionQueue', logData.parentProcess, logData.username,
        {'userQueueData.screenName':(userQueueData)?userQueueData.screenName:'invalid'}, 'Adding user to mention queue');
      userQueueData.logData = logData;
      self.mentionQueue.push(userQueueData, function(){});
    } else {
      log.functionError(QUEUE, 'addUserToMentionQueue', logData.parentProcess, logData.username, 'User is already in mention queue')
    }
  };

  // Function to add user to tweet queue
  TwitterRestQueue.prototype.addUserToTweetQueue = function(userQueueData, logData) {
    log.functionCall(QUEUE, 'addUserToTweetQueue', logData.parentProcess, logData.username,
      {'userQueueData.screenName':(userQueueData)?userQueueData.screenName:'invalid'});

    var isAddRequestValid = true;

    var queueUserId = userQueueData.userId + '';
    if(queueUserId == self.currentTweetUserId) {
      isAddRequestValid = false;
    } else {

      // Verify user is not already in queue
      var tasks = self.tweetQueue.tasks;
      for(var i = 0; i < tasks.length; i++) {
        if(tasks[i].data.userId == userQueueData.userId) {
          isAddRequestValid = false;
          break;
        }
      }
    }

    if(isAddRequestValid == true) {
      log.functionCall(QUEUE, 'addUserToTweetQueue', logData.parentProcess, logData.username,
        {'userQueueData.screenName':(userQueueData)?userQueueData.screenName:'invalid'}, 'Adding user to tweet queue');
      userQueueData.logData = logData;
      self.tweetQueue.push(userQueueData, function() {});
    } else {
      log.functionError(QUEUE, 'addUserToTweetQueue', logData.parentProcess, logData.username, 'User is already in tweet queue')
    }
  };

  // Function to get estimated time for mentions in seconds
  TwitterRestQueue.prototype.getMentionsWaitTime = function(logData) {
    log.functionCall(QUEUE, 'getMentionsWaitTime', logData.parentProcess, logData.username);

    var multiplier = (MENTION_WINDOW/MENTION_REQUESTS_PER_WINDOW) * MAX_MENTION_REQUEST * 60;

    var queueNumber = self.mentionQueue.length();
    if(self.currentMentionUserId) {
      queueNumber++;
    }

    return multiplier * queueNumber;
  };

  // Function to get estimated time for tweets in seconds
  TwitterRestQueue.prototype.getTweetsWaitTime = function(logData) {
    log.functionCall(QUEUE, 'getTweetsWaitTime', logData.parentProcess, logData.username);
    var multiplier = (TWEET_WINDOW/TWEET_REQUESTS_PER_WINDOW) * MAX_TWEET_REQUEST * 60;

    var queueNumber = self.tweetQueue.length();
    if(self.currentTweetUserId) {
      queueNumber++;
    }

    return multiplier * queueNumber;
  };

  // Function to get the estimated wait time for a specific user's mentions in seconds
  // Returns -1 if user doesnt exist
  TwitterRestQueue.prototype.getUsersMentionWaitTime = function(userId, logData) {
    log.functionCall(QUEUE, 'getUsersMentionWaitTime', logData.parentProcess, logData.username, {'userId':userId});

    var waitTime = -1;
    var multiplier = (MENTION_WINDOW/MENTION_REQUESTS_PER_WINDOW) * MAX_MENTION_REQUEST * 60;

    if(self.currentMentionUserId == userId) {
      waitTime = multiplier;
    } else {
      var taskPosition = self.mentionQueue.getTaskPosition('userId', userId);
      if(taskPosition != -1) {
        waitTime = multiplier * (taskPosition + 1);
      }
    }
    return waitTime;
  };

  // Function to get the estimated wait time for a specific user's tweets in seconds.
  // Returns -1 if user doesnt exist in queue
  TwitterRestQueue.prototype.getUsersTweetWaitTime = function(userId, logData) {
    log.functionCall(QUEUE, 'getUsersTweetWaitTime', logData.parentProcess, logData.username, {'userId':userId});

    var waitTime = -1;
    var multiplier = (TWEET_WINDOW/TWEET_REQUESTS_PER_WINDOW) * MAX_TWEET_REQUEST * 60;

    if(self.currentTweetUserId == userId) {
      waitTime = multiplier;
    } else {
      var taskPosition = self.tweetQueue.getTaskPosition('userId', userId);
      if(taskPosition != -1) {
        waitTime = multiplier * (taskPosition + 1);
      }
    }
    return waitTime;
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  // Private function to retrieve mentions given a user's information
  var getUserMentions = function(queueData, callback) {
    var logData = queueData.logData;
    log.functionCall(QUEUE, 'getUserMentions (private)', logData.parentProcess, logData.username,
      {'queueData.screenName':(queueData)?queueData.screenName:'invalid'});

    // User information
    var userId = queueData.userId;
    var screenName = queueData.screenName;
    var tweetId = queueData.tweetId;
    var isNewUser = queueData.isNewUser;

    // Check for new user
    if(isNewUser === true) {
      self.mentionMessenger = TwitterInterfaceService.createTwitterMessenger(queueData.accessToken, queueData.secretAccessToken, logData);
      self.userMentionTweets = new Array();
    }

    // Get Mentions
    TwitterInterfaceService.getMentions(self.mentionMessenger, screenName, logData, function(error, mentionTweets) {
      log.functionCall(QUEUE, 'getUserMentions (private)', logData.parentProcess, logData.username,
        {'error':error,'mentionTweets.length':(mentionTweets)?mentionTweets.length:'invalid'}, 'Received tweets from Twitter');

      if(mentionTweets.length == 0) {

        // Set current mentions userId to null
        self.currentMentionUserId = null;

        // Reset global variables
        self.mentionMessenger = null;
        self.userMentionTweets = null;

        callback();
        return;
      }

      if(error) {
        log.functionError(QUEUE, 'getUserMentions (private)', logData.parentProcess, logData.username,
          'Failed to retrieve mentions from Twitter');
        return;
      }

      // nextTweetId will be used to retrieve the next set of mentionTweets and mentions
      var nextTweetId = mentionTweets[mentionTweets.length-1].tweetId;

      // Remove first element from mentionTweets if a tweet id was passed in
      if(tweetId) {
        mentionTweets = AugeoUtility.trimArray(mentionTweets, logData);
      }

      // Push mentionTweets into mentionTweets
      var isMinMentionFound = false;
      for(var i = 0; i < mentionTweets.length;i++) {
        if(mentionTweets[i].tweetId == queueData.minMentionTweetId) {
          isMinMentionFound = true;
          break;
        } else {
          self.userMentionTweets.push(mentionTweets[i])
        }
      }

      // If there are more mention tweets to retrieve..
      if(tweetId != nextTweetId && isMinMentionFound == false) {

        // Place request for user to abtain more mentionTweets on the front of the mention queue
        queueData.tweetId = nextTweetId;
        queueData.isNewUser = false;
        self.mentionQueue.unshift(queueData, function(){});
        callback();

      } else { // If all mentions have been retrieved..
        log.functionCall(QUEUE, 'getUserMentions (private)', logData.parentProcess, logData.username, {'screenName':screenName},
          'Retrieved all mention tweets');

        // Set current mentions userId to null
        self.currentMentionUserId = null;

        var areMentions = true;
        TwitterService.addTweets(userId, screenName, self.userMentionTweets, areMentions, logData, function() {

          // Reset global variables
          self.mentionMessenger = null;
          self.userMentionTweets = null;

          UserService.updateAllRanks(logData, callback);
        });
      }
    }, tweetId); // End getTweets
  };

  // Private function to retrieve tweets given a user's information
  var getUserTweets = function(queueData, callback) {
    var logData = queueData.logData;
    log.functionCall(QUEUE, 'getUserTweets (private)', logData.parentProcess, logData.username,
      {'queueData.screenName':(queueData)?queueData.screenName:'invalid'});

    // User information
    var userId = queueData.userId;
    var screenName = queueData.screenName;
    var tweetId = queueData.tweetId;
    var isNewUser = queueData.isNewUser;

    // Check for new user
    if(isNewUser === true) {
      self.tweetMessenger = TwitterInterfaceService.createTwitterMessenger(queueData.accessToken, queueData.secretAccessToken, logData);
      self.userTweets = new Array();
    }

    // Get tweets
    TwitterInterfaceService.getTweets(self.tweetMessenger, logData, function(error, tweets) {
      log.functionCall(QUEUE, 'getUserTweets (private)', logData.parentProcess, logData.username,
        {'error':error,'tweets.length':(tweets)?tweets.length:'invalid'}, 'Received tweets from Twitter');

      if(tweets.length == 0) {

        // Set current mentions userId to null
        self.currentTweetUserId = null;

        // Reset global variables
        self.tweetMessenger = null;
        self.userTweets = null;

        callback();
        return;
      }

      // Check for error from getting tweets
      if(error) {
        log.functionError(QUEUE, 'getUserTweets (private)', logData.parentProcess, logData.username,
          'Failed to retrieve tweets from Twitter');
        return;
      }

      // nextTweetId will be used to retrieve the next set of tweets
      var nextTweetId = tweets[tweets.length-1].tweetId;

      // Remove first element from tweets if a tweet id was passed in
      if(tweetId) {
        tweets = AugeoUtility.trimArray(tweets, logData);
      }

      // Push tweets into userTweets
      var isMinTweetFound = false; // Used to retrieve new tweets only
      for(var i = 0; i < tweets.length;i++) {
        if(tweets[i].tweetId == queueData.minTweetId) {
          isMinTweetFound = true;
          break;
        } else {
          self.userTweets.push(tweets[i])
        }
      }

      // If there are more tweets to retrieve..
      if(tweetId != nextTweetId && isMinTweetFound == false) {

        // Place request for user to abtain more tweets on the front of the queue
        queueData.tweetId = nextTweetId;
        queueData.isNewUser = false;
        self.tweetQueue.unshift(queueData, function() {});
        callback();

      } else { // If all tweets have been retrieved..
        log.functionCall(QUEUE, 'getUserTweets (private)', logData.parentProcess, logData.username, {'screenName':screenName},
          'Retrieved all tweets');

        // Set current tweet userId to null
        self.currentTweetUserId = null;

        var areMentions = false;
        TwitterService.addTweets(userId, screenName, self.userTweets, areMentions, logData, function() {

          // Reset global variables
          self.tweetMessenger = null;
          self.userTweets = null;

          UserService.updateAllRanks(logData, callback);
        });
      }
    }, tweetId); // End getTweets
  };

  var onMentionRequestOpen = function(logData, callback) {
    log.functionCall(QUEUE, 'onMentionRequestOpen (private)', logData.parentProcess, logData.username, {'mentionRequestOpen':self.mentionRequestOpen});
    if(self.mentionRequestOpen == true) {
      callback();
    } else {
      setTimeout(function() {onMentionRequestOpen(logData, callback)}, CHECK_MENTION_QUEUE_OPEN_TIMEOUT);
    }
  };

  var onTweetRequestOpen = function(logData, callback) {
    log.functionCall(QUEUE, 'onTweetRequestOpen (private)', logData.parentProcess, logData.username, {'tweetRequestOpen':self.tweetRequestOpen});
    if(self.tweetRequestOpen == true) {
      callback();
    } else {
      setTimeout(function() {onTweetRequestOpen(logData, callback)}, CHECK_TWEET_QUEUE_OPEN_TIMEOUT);
    }
  };

  var startMentionTimer = function(logData) {
    log.functionCall(QUEUE, 'startMentionTimer (private)', logData.parentProcess, logData.username);
    self.mentionRequestOpen = false;
    setTimeout(function() {
      self.mentionRequestOpen = true;
    }, MENTION_TIMEOUT);
  };

  var startTweetTimer = function(logData) {
    log.functionCall(QUEUE, 'startTweetTimer (private)', logData.parentProcess, logData.username);
    self.tweetRequestOpen = false;
    setTimeout(function() {
      self.tweetRequestOpen = true;
    }, TWEET_TIMEOUT);
  };

  module.exports = TwitterRestQueue;
