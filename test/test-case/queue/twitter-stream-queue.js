
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
  /* Description: Unit test cases for queue/twitter-stream-queue               */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../common');
  var TwitterInterface = require('../../interface/twitter-test-interface');
  var TwitterStreamQueue = require('../../../src/queue/twitter-stream-queue');
  var TwitterUtility = require('../../../src/utility/twitter-utility');

  // Global variables
  var Tweet = AugeoDB.model('Tweet');
  var Mention = AugeoDB.model('Mention');
  var User = AugeoDB.model('User');
  var streamQueue = new TwitterStreamQueue();

  it('should add standard tweet to database and update ranks -- addAction("Add")', function(done) {
    this.timeout(Common.TIMEOUT);

    // Get original experience for User and Actionee
    User.getUserWithEmail(Common.USER.email, function(initialUser) {

      var initialUserExperience = initialUser.twitter.skill.experience;

      var queueData = {};
      queueData.action = 'Add';
      queueData.data = Common.rawStandardTweet;

      streamQueue.addAction(queueData, function() {

        // Verify tweet is in database
        Tweet.findTweet(Common.rawStandardTweet.id_str, function(rawStandardTweet) {
          Assert.strictEqual(Common.rawStandardTweet.id_str, rawStandardTweet[0].tweetId);

          // Verify experience gained
          User.getUserWithEmail(Common.USER.email, function(userAfter) {
            var userAfterExperience = userAfter.twitter.skill.experience;
            Assert.strictEqual(userAfterExperience, initialUserExperience + TwitterUtility.getTweetExperience() + TwitterUtility.getRetweetExperience());

            // Verify ranks
            User.getSkillRank(Common.USER.username, 'Twitter', function(userRank1) {
              User.getSkillRank(Common.ACTIONEE.username, 'Twitter', function(actioneeRank1) {
                userRank1.should.be.below(actioneeRank1);
                done();
              });
            });
          });
        });
      });
    });
  });

  // Actionee Tweet that mentions user
  it('should add an Actionee Tweet that mentions User -- addAction("Add")', function(done) {
    this.timeout(Common.TIMEOUT);

    // Get original experience for User and Actionee
    User.getUserWithEmail(Common.USER.email, function(initialUser) {
      User.getUserWithEmail(Common.ACTIONEE.email, function(initialActionee) {

        var initialUserExperience = initialUser.twitter.skill.experience;
        var initialActioneeExperience = initialActionee.twitter.skill.experience;

        var queueData = {};
        queueData.action = 'Add';
        queueData.data = Common.rawMentionOfTestUser;

        streamQueue.addAction(queueData, function() {

          // Verify tweet is in database
          Tweet.findTweet(Common.rawMentionOfTestUser.id_str, function(rawMentionOfTestUser) {
            Assert.strictEqual(Common.rawMentionOfTestUser.id_str, rawMentionOfTestUser[0].tweetId);

            // Verify mention is in database
            Mention.findMention(Common.rawMentionOfTestUser.entities.user_mentions[0].screen_name, Common.rawMentionOfTestUser.id_str, function(mention) {
              Assert.strictEqual(Common.rawMentionOfTestUser.id_str, mention[0].tweetId);

              // Get after experience for User and Actionee
              User.getUserWithEmail(Common.USER.email, function(userAfter) {
                User.getUserWithEmail(Common.ACTIONEE.email, function(actioneeAfter) {

                  var userAfterExperience = userAfter.twitter.skill.experience;
                  var actioneeAfterExperience = actioneeAfter.twitter.skill.experience;

                  // Verify experience gained
                  Assert.strictEqual(userAfterExperience, initialUserExperience + TwitterUtility.getMentionExperience());
                  Assert.strictEqual(actioneeAfterExperience, initialActioneeExperience + TwitterUtility.getTweetExperience());

                  // Verify ranks
                  User.getSkillRank(Common.USER.username, 'Twitter', function(userRank1) {
                    User.getSkillRank(Common.ACTIONEE.username, 'Twitter', function(actioneeRank1) {
                      userRank1.should.be.below(actioneeRank1);
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

  // Actionee retweets user
  it('should add an Actionee tweet and increase a retweet count for User -- addAction("Add")', function(done) {
    this.timeout(Common.TIMEOUT);

    // Get original experience for User and Actionee
    User.getUserWithEmail(Common.USER.email, function(initialUser) {
      User.getUserWithEmail(Common.ACTIONEE.email, function(initialActionee) {

        var initialUserExperience = initialUser.twitter.skill.experience;
        var initialActioneeExperience = initialActionee.twitter.skill.experience;

        var queueData0 = {};
        queueData0.action = 'Add';
        queueData0.data = Common.rawStandardTweet;

        // Insert User's tweet to be retweeted
        streamQueue.addAction(queueData0, function() {

          initialUserExperience += (Common.rawStandardTweet.retweet_count * TwitterUtility.getRetweetExperience()) + (Common.rawStandardTweet.favorite_count * TwitterUtility.getFavoriteExperience());

          // Verify tweet is in database
          Tweet.findTweet(Common.rawStandardTweet.id_str, function(originalTweet) {

            // Get original retweet count
            var originalRetweetCount = originalTweet[0].retweetCount;

            var queueData1 = {};
            queueData1.action = 'Add';
            queueData1.data = Common.rawRetweetOfUser;

            // Add the retweet
            streamQueue.addAction(queueData1, function() {

              // Verify tweet is in database
              Tweet.findTweet(Common.rawRetweetOfUser.id_str, function(retweetOfUser) {
                Assert.strictEqual(Common.rawRetweetOfUser.id_str, retweetOfUser[0].tweetId);

                // Verify retweet count incremented
                Tweet.findTweet(Common.rawStandardTweet.id_str, function(originalTweetAfter) {
                  Assert.strictEqual(originalRetweetCount+1, originalTweetAfter[0].retweetCount);

                  // Get after experience for User and Actionee
                  User.getUserWithEmail(Common.USER.email, function(userAfter) {
                    User.getUserWithEmail(Common.ACTIONEE.email, function(actioneeAfter) {

                      var userAfterExperience = userAfter.twitter.skill.experience;
                      var actioneeAfterExperience = actioneeAfter.twitter.skill.experience;

                      // Verify experience gained
                      Assert.strictEqual(userAfterExperience, initialUserExperience + TwitterUtility.getTweetExperience() + TwitterUtility.getRetweetExperience());
                      Assert.strictEqual(actioneeAfterExperience, initialActioneeExperience + TwitterUtility.getTweetExperience());

                      // Verify ranks
                      User.getSkillRank(Common.USER.username, 'Twitter', function(userRank1) {
                        User.getSkillRank(Common.ACTIONEE.username, 'Twitter', function(actioneeRank1) {
                          userRank1.should.be.below(actioneeRank1);
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

  it('should remove tweet with no mentions or retweets and update the users experience -- addAction("Remove")', function(done) {
    this.timeout(Common.TIMEOUT);

    // First add tweet to database
    var queueData0 = {};
    queueData0.action = 'Add';
    queueData0.data = Common.rawStandardTweet;

    // Add tweet for Common.USER
    streamQueue.addAction(queueData0, function() {

      var queueData1 = {};
      queueData1.action = 'Add';
      queueData1.data = Common.rawStandardTweet2;

      // Add tweet for Common.ACTIONEE
      streamQueue.addAction(queueData1, function() {

        // Verify ranks
        User.getSkillRank(Common.USER.username, 'Twitter', function(userRank0) {
          User.getSkillRank(Common.ACTIONEE.username, 'Twitter', function(actioneeRank0) {
            userRank0.should.be.below(actioneeRank0);

            // Get original experience for User and Actionee
            User.getUserWithEmail(Common.USER.email, function(initialUser) {

              var initialUserExperience = initialUser.twitter.skill.experience;

              var queueData2 = {};
              queueData2.action = 'Remove';
              queueData2.data = {};
              queueData2.data.status = {
                id_str: Common.rawStandardTweet.id_str,
                user_id_str: Common.rawStandardTweet.user.id_str
              };

              streamQueue.addAction(queueData2, function() {

                // Verify tweet is not in database
                Tweet.findTweet(Common.rawStandardTweet.id_str, function(rawStandardTweet) {
                  Assert.strictEqual(0, rawStandardTweet.length);

                  // Verify experience removed
                  User.getUserWithEmail(Common.USER.email, function(userAfter) {
                    var userAfterExperience = userAfter.twitter.skill.experience;
                    Assert.strictEqual(userAfterExperience, initialUserExperience - TwitterUtility.getTweetExperience() - TwitterUtility.getRetweetExperience());

                    // Verify ranks
                    User.getSkillRank(Common.USER.username, 'Twitter', function(userRank1) {
                      User.getSkillRank(Common.ACTIONEE.username, 'Twitter', function(actioneeRank1) {
                        userRank1.should.be.above(actioneeRank1);
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

  it('should open a stream with Twitter on an interval -- openStream()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Get initital iteration amount
    var initialIteration = TwitterInterface.getNumberConnections();

    var queueData = {
      action: "Open",
      data: [{twitter:{twitterId:'12345678'}}],
      callback: function(){},
      removeCallback: function(){}
    };

    // Connect
    streamQueue.openStream(queueData, function(){});

    setTimeout(function() {

      // Verify connect iterations is 1
      Assert.strictEqual(initialIteration+1, TwitterInterface.getNumberConnections());

      // Connect
      streamQueue.openStream(queueData, function(){});

      setTimeout(function() {

        // Verify connect iterations is 1
        Assert.strictEqual(initialIteration+1, TwitterInterface.getNumberConnections());

        // Set timeout for 500 milliseconds
        setTimeout(function() {

          // Verify connect iterations is 2
          Assert.strictEqual(initialIteration+2, TwitterInterface.getNumberConnections());

          done();
        }, 500);
      }, 500);
    }, 500);
  });
