
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
  var Mention = AugeoDB.model('Mention');
  var Tweet = AugeoDB.model('Tweet');
  var User = AugeoDB.model('User');
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

    // Get mention count before adding mentions
    Mention.getMentionCount(function(initialMentionCount) {

      // Get Test Tester's user id from database
      User.getUserWithEmail(Common.USER.email, function(initialUser) {

        User.getUserWithEmail(Common.ACTIONEE.email, function(initialUser2) {

          var userId = initialUser._id + '';
          TwitterService.getQueueData(userId, Common.USER.twitter.screenName, function(queueData) {

            var userId2 = initialUser2._id + '';
            TwitterService.getQueueData(userId2, Common.ACTIONEE.twitter.screenName, function(queueData2) {

              var iteration = 0;
              var mentionsAdded = 0;
              queueData.mentionQueueData.onIteration = function(mentionTweets, mentions) {

                // Get the number of mentions being added this iteration
                var newMentionsLength = mentionTweets.length - mentionsAdded;

                // Verify correct number of mentions are being grabbed each iteration
                if(iteration == 0) {
                  Assert.strictEqual(mentionTweets.length, Data.RETRIEVE_LIMIT);
                  Assert.strictEqual(mentions.length, Data.RETRIEVE_LIMIT);
                  mentionsAdded = mentionTweets.length;
                } else {
                  var expectedLength = mentionsAdded + newMentionsLength;
                  Assert.strictEqual(mentionTweets.length, expectedLength);
                  Assert.strictEqual(mentions.length, expectedLength);
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
                Mention.getMentionCount(function(mentionCount) {
                  Assert.strictEqual(mentionCount, initialMentionCount + mentionsAdded);

                  // Verify user experience is updated
                  User.getUserWithEmail(Common.USER.email, function(user) {
                    var expectedExperience = initialUser.twitter.skill.experience + TwitterUtility.getMentionExperience() * mentionsAdded;
                    Assert.strictEqual(user.twitter.skill.experience, expectedExperience);
                    callDone();
                  });
                });
              };

              queueData2.mentionQueueData.onFinish = function() {
                callDone();
              };

              twitterRestQueue.addUserToMentionQueue(queueData.mentionQueueData);

              // Verify wait times for when queue is only executing the current user
              Assert.strictEqual(twitterRestQueue.getMentionsWaitTime(), 1);
              Assert.strictEqual(twitterRestQueue.getUsersMentionWaitTime(userId), 1);

              // Add dummy user to test wait time
              twitterRestQueue.addUserToMentionQueue(queueData2.mentionQueueData);

              // Verify wait times for user in queue
              Assert.strictEqual(twitterRestQueue.getMentionsWaitTime(), 2);
              Assert.strictEqual(twitterRestQueue.getUsersMentionWaitTime(userId2), 2);
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
    Tweet.getTweetCount(function(initialTweetCount) {

      // Get Test Tester's user id from database
      User.getUserWithEmail(Common.USER.email, function(initialUser) {

        User.getUserWithEmail(Common.ACTIONEE.email, function(initialUser2) {

          var userId = initialUser._id + '';
          TwitterService.getQueueData(userId, Common.USER.twitter.screenName, function(queueData) {

            var userId2 = initialUser2._id + '';
            TwitterService.getQueueData(userId2, Common.ACTIONEE.twitter.screenName, function(queueData2) {

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
                Tweet.getTweetCount(function(tweetCount) {
                  Assert.strictEqual(tweetCount, initialTweetCount + tweetsAdded);

                  // Verify user experience is updated
                  User.getUserWithEmail(Common.USER.email, function(user) {
                    user.twitter.skill.experience.should.be.aboveOrEqual(initialUser.twitter.skill.experience + tweetsAdded*TwitterUtility.getTweetExperience());
                    callDone();
                  });
                });
              };

              queueData2.tweetQueueData.onFinish = function() {
                callDone();
              };

              twitterRestQueue.addUserToTweetQueue(queueData.tweetQueueData);

              // Verify wait times for when queue is only executing the current user
              Assert.strictEqual(twitterRestQueue.getTweetsWaitTime(), 4);
              Assert.strictEqual(twitterRestQueue.getUsersTweetWaitTime(userId), 4);

              // Add dummy user to test wait time
              twitterRestQueue.addUserToTweetQueue(queueData2.tweetQueueData);

              // Verify wait times for user in queue
              Assert.strictEqual(twitterRestQueue.getTweetsWaitTime(), 8);
              Assert.strictEqual(twitterRestQueue.getUsersTweetWaitTime(userId2), 8);
            });
          });
        });
      });
    });
  });

  it('should add all users to both Mention and Tweet queues -- addAllUsersToQueues()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Remove actionee to simplify test
    User.remove(Common.ACTIONEE.email, function() {

      // Add second to last tweet to user's tweets
      var data0 = Data.getSecondMostRecentTweet();
      var tweet = TwitterInterfaceService.extractTweet(data0, false);
      var tweets = new Array();
      tweets.push(tweet);
      User.getUserWithEmail(Common.USER.email, function(user) {
        TwitterService.addTweets(user._id, user.twitter.screenName, tweets, function() {

          // Verify tweet is in database
          Tweet.findTweet(tweet.tweetId, function(returnedTweet0) {
            Assert.strictEqual(tweet.tweetId, returnedTweet0[0].tweetId);

            // Add second to last mention to user's mentions
            var data1 = Data.getSecondMostRecentMention();
            var datas = Array();
            datas.push(data1);
            var mentions = TwitterInterfaceService.extractMentionData(datas, user.twitter.screenName);
            var mentionTweet = TwitterInterfaceService.extractTweet(data1, false);
            var mentionTweets = new Array();
            mentionTweets.push(mentionTweet)
            TwitterService.addMentions(user._id, user.twitter.screenName, mentionTweets, mentions, function() {

              // Verify mention is in database
              Mention.findMention(user.twitter.screenName, mentionTweet.tweetId, function(returnedMention0) {
                Assert.strictEqual(mentionTweet.tweetId, returnedMention0[0].tweetId);

                // Verify that the last raw tweet is not in the TWEET table
                var latestTweet = Data.getOldestTweet();
                Tweet.findTweet(latestTweet.id_str, function(returnedTweet1) {
                  Assert.strictEqual(0, returnedTweet1.length);

                  // Verify that the last raw mention is not in the MENTION table
                  var latestMention = Data.getOldestMention();
                  Mention.findMention(user.twitter.screenName, latestMention.id_str, function(returnedMention1) {
                    Assert.strictEqual(0, returnedMention1.length);

                    twitterRestQueue.addAllUsersToQueues('TWEET',function() {

                      // Verify the last raw tweet is in the Tweet table
                      Tweet.findTweet(latestTweet.id_str, function(returnedTweet2) {
                        Assert.strictEqual(latestTweet.id_str, returnedTweet2[0].tweetId);

                        twitterRestQueue.addAllUsersToQueues('MENTION', function() {
                          // Verify the last raw mention is in the Mention table
                          Mention.findMention(user.twitter.screenName, latestMention.id_str, function(returnedMention2) {
                            Assert.strictEqual(latestMention.id_str, returnedMention2[0].tweetId);
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
  });
