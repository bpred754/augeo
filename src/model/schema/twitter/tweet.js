
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
  /* Description: Logic for TWEET database collection                        */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'tweet-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var TWITTER_TWEET = Mongoose.Schema({
    avatarImageSrc: String,
    favoriteCount: Number,
    hashtags: [String],
    links: [String],
    media: {
      url: String,
      width: Number,
      height: Number
    },
    mentions: [String], // Screen Name
    name: String,
    retweetCount: Number,
    screenName: String,
    text: String,
    tweetId: String,
    twitterId: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  TWITTER_TWEET.statics.addTweet = function(tweet, logData, callback) {

    // Add tweet if it doesn't exist and update when it does exist
    upsertTweet(this, tweet, logData, callback);
  };

  TWITTER_TWEET.statics.addTweets = function(tweets, logData, callback) {

    // Add tweets if they don't exist and update when they do exist
    upsertTweets(this, tweets, logData, callback);
  };

  TWITTER_TWEET.statics.getLatestMentionTweetId = function(screenName, logData, callback) {
    this.find({mentions:{$elemMatch:{$eq: screenName}}},{},{sort:{'tweetId':-1},limit:1}).lean().exec(function(error, data) {

      if(error) {
        log.functionError(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username,
          'Failed to find tweet with max mention tweetId for user:' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username, {'screenName':screenName});

        var latestTweetId;
        if(data[0]) {
          log.functionCall(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username, {'screenName':screenName},
            'Latest Mention TweetId: ' + data[0].tweetId);
          latestTweetId = data[0].tweetId;
        }
        callback(latestTweetId);
      }
    });
  };

  TWITTER_TWEET.statics.getLatestTweetId = function(screenName, logData, callback) {
    this.find({screenName:screenName},{},{sort:{'tweetId':-1},limit:1}).lean().exec(function(error, data) {

      if(error) {
        log.functionError(COLLECTION, 'getLatestTweetId', logData.parentProcess, logData.username, 'Failed to find tweet with max tweetId for user:' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getLatestTweetId', logData.parentProcess, logData.username, {'screenName':screenName});

        var latestTweetId;
        if(data[0]) {
          log.functionCall(COLLECTION, 'getLatestTweetId', logData.parentProcess, logData.username, {'screenName':screenName},
            'Latest TweetId: ' + data[0].tweetId);
          latestTweetId = data[0].tweetId;
        }
        callback(latestTweetId);
      }
    });
  };

  TWITTER_TWEET.statics.getMentionCount = function(screenName, logData, callback) {
    this.count({mentions:{$elemMatch:{$eq: screenName}}}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'getMentionCount', logData.parentProcess, logData.username, 'Failed to retrieve mention count. ' + error);
      } else {
        log.functionCall(COLLECTION, 'getMentionCount', logData.parentProcess, logData.username, {'screenName': screenName});
        callback(count);
      }
    })
  };

  TWITTER_TWEET.statics.getTweet = function(tweetId, logData, callback) {
    this.findOne({tweetId:tweetId},{},{}, function(error, tweet) {
      if(error) {
        log.functionError(COLLECTION, 'getTweet', logData.parentProcess, logData.username, 'Failed to get tweet with tweetID: ' + tweetId);
      } else {
        log.functionCall(COLLECTION, 'getTweet', logData.parentProcess, logData.username, {'tweetId':tweetId});
        callback(tweet);
      }
    });
  };

  TWITTER_TWEET.statics.getTweetCount = function(logData, callback) {
    this.count({}, function(error, count) {
        if(error) {
          log.functionError(COLLECTION, 'getTweetCount', logData.parentProcess, logData.username, 'Failed to retrieve tweet count. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getTweetCount', logData.parentProcess, logData.username);
          callback(count)
        }
    });
  };

  TWITTER_TWEET.statics.incrementRetweetCount = function(tweetId, logData, callback) {
    this.findOneAndUpdate({tweetId:tweetId}, {$inc: {retweetCount:1}}, {'new':true}, function(error, updatedTweet) {
      if(error) {
        log.functionError(COLLECTION, 'incrementRetweetCount', logData.parentProcess, logData.username, 'Failed to increment retweet count for tweet with ID: ' + tweetId);
      } else {
        log.functionCall(COLLECTION, 'incrementRetweetCount', logData.parentProcess, logData.username, {'tweetId':tweetId});
        callback(updatedTweet);
      }
    });
  };

  TWITTER_TWEET.statics.removeTweet = function(tweetId, logData, callback) {
    this.remove({tweetId:tweetId}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeTweet', logData.parentProcess, logData.username, 'Failed to remove tweet with id: ' + tweetId + '. Error:' + error);
      } else {
        log.functionCall(COLLECTION, 'removeTweet', logData.parentProcess, logData.username, {'tweetId':tweetId});
        callback();
      }
    });
  };

  TWITTER_TWEET.statics.removeTweets = function(screenName, logData, callback) {
    this.remove({screenName:screenName}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeTweets', logData.parentProcess, logData.username,
          'Failed to remove tweets for screenName: ' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'removeTweets', logData.parentProcess, logData.username, {'screenName':screenName});
      }
      callback();
    });
  };

  TWITTER_TWEET.statics.removeTweetsWithMentionee = function(screenName, logData, callback) {
    this.remove({mentions:{$elemMatch:{$eq: screenName}}}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeTweetsWithMentionee', logData.parentProcess, logData.username,
          'Failed to remove tweets for screenName: ' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'removeTweetsWithMentionee', logData.parentProcess, logData.username, {'screenName':screenName});
      }
      callback();
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var upsertTweet = function(tweetDocument, tweet,logData, callback) {
    tweetDocument.findOneAndUpdate({tweetId:tweet.tweetId}, tweet, {upsert:true, 'new':true}, function(error, updatedTweet) {
      if (error) {
        log.functionError(COLLECTION, 'upsertTweet (private)', logData.parentProcess, logData.username,
          'Failed to upsert tweet with ID: ' + (tweet)?tweet.tweetId:'invalid' + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'upsertTweet (private)', logData.parentProcess, logData.username, {'tweetDocument':(tweetDocument)?'defined':'invalid',
          'tweet':(tweet)?tweet.tweetId:'invalid'});
        callback(updatedTweet);
      }
    });

  };

  var upsertTweets = function(tweetDocument, tweets, logData, callback) {
    var updatedTweets = new Array();

    if(tweets.length > 0) {
      // Asynchronous method calls in loop - Using Recursion
      (function myClojure(i) {
        upsertTweet(tweetDocument, tweets[i], logData, function (updatedTweet) {
          updatedTweets.push(updatedTweet);
          i++;
          if (i < tweets.length) {
            myClojure(i);
          } else {
            callback(updatedTweets);
          }
        });
      })(0); // Pass i as 0 and myArray to myClojure
    } else {
      callback(updatedTweets);
    }
  };

  // Declare Model
  module.exports = AugeoDB.model('TWITTER_TWEET', TWITTER_TWEET);
