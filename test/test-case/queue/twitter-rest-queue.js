
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
  /* Description: Unit test cases for queue/twitter-rest-queue               */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../common');
  var Data = require('../../data');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterRestQueue = require('../../../src/queue/twitter-rest-queue');
  var TwitterService = require('../../../src/service/twitter-service');
  var TwitterUtility = require('../../../src/utility/twitter-utility');

  // Global variables
  var Tweet = AugeoDB.model('TWITTER_TWEET');
  var User = AugeoDB.model('AUGEO_USER');
  var twitterRestQueue = new TwitterRestQueue();

  it('should add a user to the mention queue -- addUserToMentionQueue()', function(done) {
    this.timeout(Common.TIMEOUT);

    var isFirstQueueFinished = false;
    var callDone = function() {
      if(isFirstQueueFinished === true) {
        done();
      } else {
        isFirstQueueFinished = true;
      }
    };

    // Get Test Tester's user id from database
    User.getUserWithEmail(Common.USER.email, Common.logData, function(initialUser) {

      // Get mention count before adding mentions
      Tweet.getMentionCount(initialUser.twitter.screenName, Common.logData, function(initialMentionCount) {

        User.getUserWithEmail(Common.ACTIONEE.email, Common.logData, function(initialUser2) {

          var userId = initialUser._id + '';
          TwitterService.getQueueData(userId, Common.USER_TWITTER.screenName, Common.logData, function(queueData) {

            var userId2 = initialUser2._id + '';
            TwitterService.getQueueData(userId2, Common.ACTIONEE_TWITTER.screenName, Common.logData, function(queueData2) {

              var iteration = 0;
              var mentionsAdded = 0;
              queueData.mentionQueueData.onIteration = function(mentionTweets, mentions) {

                // Get the number of mentions being added this iteration
                var newMentionsLength = mentionTweets.length - mentionsAdded;

                // Verify correct number of mentions are being grabbed each iteration
                if(iteration == 0) {
                  Assert.strictEqual(mentionTweets.length, Data.RETRIEVE_LIMIT);
                  mentionsAdded = mentionTweets.length;
                } else {
                  var expectedLength = mentionsAdded + newMentionsLength;
                  Assert.strictEqual(mentionTweets.length, expectedLength);
                  mentionsAdded = expectedLength;
                }
                iteration++;
              };

              queueData.mentionQueueData.onFinish = function() {
                iteration++;

                // Verify number of iterations
                var rawMentionCount = Data.getMentionCount();
                var adjustedCount = rawMentionCount - Data.RETRIEVE_LIMIT;
                var expectedIterations = 1 + Math.ceil(adjustedCount/(Data.RETRIEVE_LIMIT-1)) + 1;

                Assert.strictEqual(iteration, expectedIterations);

                // Verify correct number of mentions were inserted to the Mention table
                Tweet.getMentionCount(initialUser.twitter.screenName, Common.logData, function(mentionCount) {
                  Assert.strictEqual(mentionCount, initialMentionCount + mentionsAdded);

                  // Verify user experience is updated
                  User.getUserWithEmail(Common.USER.email, Common.logData, function(user) {
                    var expectedExperience = initialUser.skill.experience + TwitterUtility.MENTION_EXPERIENCE * mentionsAdded;
                    Assert.strictEqual(user.skill.experience, expectedExperience);
                    callDone();
                  });
                });
              };

              queueData2.mentionQueueData.onFinish = function() {
                callDone();
              };

              twitterRestQueue.addUserToMentionQueue(queueData.mentionQueueData, Common.logData);

              // Verify wait times for when queue is only executing the current user
              Assert.strictEqual(twitterRestQueue.getMentionsWaitTime(Common.logData), 1);
              Assert.strictEqual(twitterRestQueue.getUsersMentionWaitTime(userId, Common.logData), 1);

              // Add dummy user to test wait time
              twitterRestQueue.addUserToMentionQueue(queueData2.mentionQueueData, Common.logData);

              // Verify wait times for user in queue
              Assert.strictEqual(twitterRestQueue.getMentionsWaitTime(Common.logData), 2);
              Assert.strictEqual(twitterRestQueue.getUsersMentionWaitTime(userId2, Common.logData), 2);
            });
          });
        });
      });
    });
  });

  it('should add a user to the Tweet queue -- addUserToTweetQueue()', function(done) {
    this.timeout(Common.TIMEOUT);

    var isFirstQueueFinished = false;
    var callDone = function() {
      if(isFirstQueueFinished === true) {
        done();
      } else {
        isFirstQueueFinished = true;
      }
    };

    // Get tweet count before adding tweets
    Tweet.getTweetCount(Common.logData, function(initialTweetCount) {

      // Get Test Tester's user id from database
      User.getUserWithEmail(Common.USER.email, Common.logData, function(initialUser) {

        User.getUserWithEmail(Common.ACTIONEE.email, Common.logData, function(initialUser2) {

          var userId = initialUser._id + '';
          TwitterService.getQueueData(userId, Common.USER_TWITTER.screenName, Common.logData, function(queueData) {

            var userId2 = initialUser2._id + '';
            TwitterService.getQueueData(userId2, Common.ACTIONEE_TWITTER.screenName, Common.logData, function(queueData2) {

              var iteration = 0;
              var tweetsAdded = 0;
              queueData.tweetQueueData.onIteration = function(tweets) {

                // Get the number of tweets being added this iteration
                var newTweetsLength = tweets.length - tweetsAdded;

                // Verify correct number of tweets are being grabbed each iteration
                if(iteration == 0) {
                  Assert.strictEqual(tweets.length, Data.RETRIEVE_LIMIT);
                  tweetsAdded = tweets.length;
                } else {
                  var expectedLength = tweetsAdded + newTweetsLength;
                  Assert.strictEqual(tweets.length, expectedLength);
                  tweetsAdded = expectedLength;
                }
                iteration++;
              };

              queueData.tweetQueueData.onFinish = function() {
                iteration++;

                // Verify number of iterations
                rawTweetCount = Data.getTweetCount();
                var adjustedCount = rawTweetCount - Data.RETRIEVE_LIMIT;
                var expectedIterations = 1 + Math.ceil(adjustedCount/(Data.RETRIEVE_LIMIT-1)) + 1;

                Assert.strictEqual(iteration, expectedIterations);

                // Verify correct number of tweets were inserted to the Tweet table
                Tweet.getTweetCount(Common.logData, function(tweetCount) {
                  Assert.strictEqual(tweetCount, initialTweetCount + tweetsAdded);

                  // Verify user experience is updated
                  User.getUserWithEmail(Common.USER.email, Common.logData, function(user) {
                    user.skill.experience.should.be.aboveOrEqual(initialUser.skill.experience + tweetsAdded*TwitterUtility.TWEET_EXPERIENCE);
                    callDone();
                  });
                });
              };

              queueData2.tweetQueueData.onFinish = function() {
                callDone();
              };

              twitterRestQueue.addUserToTweetQueue(queueData.tweetQueueData, Common.logData);

              // Verify wait times for when queue is only executing the current user
              Assert.strictEqual(twitterRestQueue.getTweetsWaitTime(Common.logData), 4);
              Assert.strictEqual(twitterRestQueue.getUsersTweetWaitTime(userId, Common.logData), 4);

              // Add dummy user to test wait time
              twitterRestQueue.addUserToTweetQueue(queueData2.tweetQueueData, Common.logData);

              // Verify wait times for user in queue
              Assert.strictEqual(twitterRestQueue.getTweetsWaitTime(Common.logData), 8);
              Assert.strictEqual(twitterRestQueue.getUsersTweetWaitTime(userId2, Common.logData), 8);
            });
          });
        });
      });
    });
  });

  it('should add all users to both Mention and Tweet queues -- addAllUsersToQueues()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Remove actionee to simplify test
    User.remove(Common.ACTIONEE.email, Common.logData, function() {

      // Add second to last tweet to user's tweets
      var data0 = Data.getSecondMostRecentTweet();
      var tweet = TwitterInterfaceService.extractTweet(data0, false, Common.logData);
      var tweets = new Array();
      tweets.push(tweet);
      User.getUserWithEmail(Common.USER.email, Common.logData, function(user) {
        TwitterService.addTweets(user._id, user.twitter.screenName, tweets, false, Common.logData, function() {

          // Verify tweet is in database
          Tweet.findTweet(tweet.tweetId, Common.logData, function(returnedTweet0) {
            Assert.strictEqual(tweet.tweetId, returnedTweet0[0].tweetId);

            // Add second to last mention to user's mentions
            var data1 = Data.getSecondMostRecentMention();
            var datas = Array();
            datas.push(data1);
            var mentionTweet = TwitterInterfaceService.extractTweet(data1, false, Common.logData);
            var mentionTweets = new Array();
            mentionTweets.push(mentionTweet)
            TwitterService.addTweets(user._id, user.twitter.screenName, mentionTweets, false, Common.logData, function() {

              // Verify mention is in database
              Tweet.findTweet(mentionTweet.tweetId, Common.logData, function(returnedTweet1) {
                returnedTweet1[0].mentions.indexOf(user.twitter.screenName).should.be.above(-1);

                // Verify that the last raw tweet is not in the TWEET table
                var latestTweet = Data.getOldestTweet();
                Tweet.findTweet(latestTweet.id_str, Common.logData, function(returnedTweet2) {
                  Assert.strictEqual(0, returnedTweet2.length);

                  twitterRestQueue.addAllUsersToQueues('TWEET', Common.logData, function() {

                    // Verify the last raw tweet is in the Tweet table
                    Tweet.findTweet(latestTweet.id_str, Common.logData, function(returnedTweet3) {
                      Assert.strictEqual(latestTweet.id_str, returnedTweet3[0].tweetId);

                      twitterRestQueue.addAllUsersToQueues('MENTION', Common.logData, function() {
                        // Verify the last raw mention is in the Mention table
                        var latestMention = Data.getOldestMention();
                        Tweet.findTweet(latestMention.id_str, Common.logData, function(returnedTweet4) {
                          returnedTweet4[0].mentions.indexOf(user.twitter.screenName).should.be.above(-1);
                          done();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
