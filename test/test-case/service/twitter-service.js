
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
  /* Description: Unit test cases for service/twitter-service                */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var AugeoUtility = require('../../../src/utility/augeo-utility');
  var Common = require('../common');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterService = require('../../../src/service/twitter-service');
  var TwitterUtility = require('../../../src/utility/twitter-utility');
  var UserService = require('../../../src/service/user-service');

  // Global variables
  var Mention = AugeoDB.model('TWITTER_MENTION');
  var Tweet = AugeoDB.model('TWITTER_TWEET');
  var User = AugeoDB.model('AUGEO_USER');

  // updateTwitterInfo
  it("should add Test Tester's Twitter information to database entry -- updateTwitterInfo()", function(done) {
    this.timeout(Common.TIMEOUT);

    // Get Test Tester's user id from database
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      Assert.ok(user._id);
      var userId = user._id.toString();

      // Get Test Tester's twitter information from database
      var twitterMessenger = '';
      TwitterInterfaceService.getTwitterUser(twitterMessenger, Common.USER.twitter.screenName, Common.logData, function(userData) {

        Assert.ok(userData.twitterId);
        Assert.strictEqual(userData.name, Common.USER.fullName);

        userData.accessToken = Common.USER.twitter.accessToken;
        userData.secretAccessToken = Common.USER.twitter.secretAccessToken;

        TwitterService.updateTwitterInfo(userId, Common.USER, userData, Common.logData, function() {

          // Retrieve Test Tester again from database to verify information was updated
          User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfterUpdate) {

            Assert.strictEqual(userAfterUpdate.firstName, Common.USER.firstName);
            Assert.strictEqual(userAfterUpdate.lastName, Common.USER.lastName);
            Assert.strictEqual(userAfterUpdate.twitter.twitterId, Common.USER.twitter.twitterId);
            Assert.strictEqual(userAfterUpdate.twitter.name, Common.USER.fullName);
            Assert.strictEqual(userAfterUpdate.twitter.screenName, Common.USER.twitter.screenName);
            Assert.strictEqual(userAfterUpdate.skill.imageSrc, Common.USER.skill.imageSrc);
            Assert.strictEqual(userAfterUpdate.skill.level, 1);
            Assert.strictEqual(userAfterUpdate.skill.experience, 0);

            var subSkills = userAfterUpdate.subSkills;
            for(var i = 0; i < subSkills.length; i++) {
              Assert.strictEqual(subSkills[i].level, 1);
              Assert.strictEqual(subSkills[i].experience, 0);
            }
            done();
          });
        }, function(){});
      }, function(){});
    });
  });

  // addAction
  it("should update TWEET/MENTION/USER collections for Test Tester's actions -- addAction()", function(done) {
    this.timeout(Common.TIMEOUT);

    // Standard Tweet from Test Tester
    var action0 = TwitterInterfaceService.extractAction(Common.rawStandardTweet, Common.logData);
    var tweet0 = TwitterInterfaceService.extractTweet(Common.rawStandardTweet, false, Common.logData);
    var mention0 = TwitterInterfaceService.extractReply(Common.rawStandardTweet, Common.logData);

    var experience = 0;
    // Determine initial skill experience
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user0) {
      experience = user0.skill.experience;

      TwitterService.addAction(action0, tweet0, mention0, Common.logData, function(classification0) {

        // Verify tweet was added
        Tweet.findTweet(tweet0.tweetId, Common.logData, function(returnedTweet0) {
          Assert.strictEqual(returnedTweet0[0].experience, TwitterUtility.TWEET_EXPERIENCE + TwitterUtility.RETWEET_EXPERIENCE);
          experience += returnedTweet0[0].experience;

          // Verify experience was added to twitter skill
          User.getUserWithUsername(Common.USER.username, Common.logData, function(user1) {
            Assert.strictEqual(user1.skill.experience, experience);

            // A tweet with Test Tester mentioned
            var action1 = TwitterInterfaceService.extractAction(Common.rawMentionOfTestUser, Common.logData);
            var tweet1 = TwitterInterfaceService.extractTweet(Common.rawMentionOfTestUser, false, Common.logData);
            var mention1 = TwitterInterfaceService.extractReply(Common.rawMentionOfTestUser, Common.logData);

            TwitterService.addAction(action1, tweet1, mention1, Common.logData, function(classification1) {

              // Verify tweet was added for user doing the mentioning
              Tweet.findTweet(tweet1.tweetId, Common.logData, function(returnedTweet1) {
                Assert.strictEqual(returnedTweet1[0].screenName, Common.ACTIONEE.twitter.screenName);
                Assert.strictEqual(returnedTweet1[0].experience, TwitterUtility.TWEET_EXPERIENCE);
                experience += returnedTweet1[0].experience;

                Mention.getMention(tweet1.tweetId, Common.logData, function(returnedMention0) {
                  Assert.strictEqual(returnedMention0[0].mentioneeScreenName, Common.USER.twitter.screenName);

                  // Verify experience was added to twitter skill
                  User.getUserWithUsername(Common.USER.username, Common.logData, function(user2) {
                    Assert.strictEqual(user2.skill.experience, experience);

                    // User retweets Test Tester's post
                    var action2 = TwitterInterfaceService.extractAction(Common.rawRetweetOfUser, Common.logData);
                    var tweet2 = TwitterInterfaceService.extractTweet(Common.rawRetweetOfUser, false, Common.logData);
                    var mention2 = TwitterInterfaceService.extractReply(Common.rawRetweetOfUser, Common.logData);

                    // Get original experience and retweet count of tweet to be retweeted
                    Tweet.findTweet(action2.retweetId, Common.logData, function(returnedTweet2) {
                      var originalTweetExperience = returnedTweet2[0].experience;
                      var originalRetweetCount = returnedTweet2[0].retweetCount;

                      TwitterService.addAction(action2, tweet2, mention2, Common.logData, function(classification2) {

                        // Verify tweet was added for user doing retweeting
                        Tweet.findTweet(tweet2.tweetId, Common.logData, function(returnedTweet3) {
                          Assert.strictEqual(returnedTweet3[0].screenName, Common.ACTIONEE.twitter.screenName);
                          Assert.strictEqual(returnedTweet3[0].experience, TwitterUtility.TWEET_EXPERIENCE);
                          experience += TwitterUtility.RETWEET_EXPERIENCE;

                          // Verify original tweet's experience and retweet count increased
                          Tweet.findTweet(action2.retweetId, Common.logData, function(returnedTweet4) {

                            Assert.strictEqual(returnedTweet4[0].experience, originalTweetExperience + TwitterUtility.RETWEET_EXPERIENCE);
                            Assert.strictEqual(returnedTweet4[0].retweetCount, originalRetweetCount + 1);

                            // Verify user's skill experience
                            User.getUserWithUsername(Common.USER.username, Common.logData, function(user3) {
                              Assert.strictEqual(user3.skill.experience, experience);
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
  });

  // addMentions
  it('should add mentions from raw mention collection -- addMentions()', function(done) {
    this.timeout(Common.TIMEOUT);

    var twitterMessenger = {};
    TwitterInterfaceService.getMentions(twitterMessenger, Common.USER.twitter.screenName, Common.logData, function(error, mentionTweets, mentions) {

      var tweetIDs = new Array();
      for(var i = 0; i < mentionTweets.length; i++) {
        // Add tweet ids to array to check if they exist in DB
        tweetIDs.push(mentionTweets[i].tweetId)

        // Change user of tweet to Actionee so DB is easier to clean up
        mentionTweets[i].twitterId = Common.ACTIONEE.twitter.twitterId;
        mentionTweets[i].screenName = Common.ACTIONEE.twitter.screenName;
        mentionTweets[i].name = Common.ACTIONEE.fullName;
      }

      // Count how many mentions are for Test Tester
      var count = 0;
      var mentionIDs = new Array();
      var filteredMentions = new Array();
      for(var i = 0; i < mentions.length; i++) {
        if(mentions[i].mentioneeScreenName === Common.USER.twitter.screenName) {
          mentionIDs.push(mentions[i].tweetId);
          filteredMentions.push(mentions[i]); // Filter mentions so DB is easier to clean up
          count++;
        }
      }

      User.getUserWithScreenName(Common.USER.twitter.screenName, Common.logData, function(userBefore) {
        var initialExperience = userBefore.skill.experience;
        TwitterService.addMentions(userBefore._id, Common.USER.twitter.screenName, mentionTweets, filteredMentions, Common.logData, function() {
          User.getUserWithScreenName(Common.USER.twitter.screenName, Common.logData, function(userAfter) {
            Assert.strictEqual(userAfter.skill.experience, initialExperience + count * TwitterUtility.MENTION_EXPERIENCE);

            // Asynchronous method calls in loop - Using Recursion
            (function checkMentions(i) {
              Mention.getMention(mentionIDs[i], Common.logData, function(returnedMention) {
                Assert.ok(returnedMention);
                returnedMention.length.should.be.above(0);
                i++;
                if(i < mentionIDs.length) {
                  checkMentions(i);
                } else {
                  checkTweets(0);
                }
              });
            })(0); // Pass i as 0

            function checkTweets(j) {
              Tweet.findTweet(tweetIDs[j], Common.logData, function(returnedTweet) {
                Assert.ok(returnedTweet);
                returnedTweet.length.should.be.above(0);
                j++;
                if(j < tweetIDs.length) {
                  checkTweets(j);
                } else {
                  done();
                }
              });
            };
          });
        });
      });
    });
  });

  // addTweets
  it('should add tweets from raw tweets collection -- addTweets()', function(done) {
    this.timeout(Common.TIMEOUT);

    twitterMessenger = {};
    TwitterInterfaceService.getTweets(twitterMessenger, Common.logData, function(error, tweets) {

      // Add up experiences from each tweet
      var addedExperience = 0;
      var tweetIDs = new Array();
      var tweetClassifications = new Array();
      var subSkillExperiences = [0,0,0,0,0,0,0,0,0];
      for(var i = 0; i < tweets.length; i++) {
        addedExperience += tweets[i].experience;
        tweetIDs.push(tweets[i].tweetId);
        var classification = tweets[i].classification;
        tweetClassifications.push(classification);
        subSkillExperiences[AugeoUtility.getSkillIndex(classification, Common.logData)] += tweets[i].experience;
      };

      User.getUserWithUsername(Common.USER.username, Common.logData, function(userBefore) {
        var initialExperience = userBefore.skill.experience;

        var initialSubSkillExperiences = [0,0,0,0,0,0,0,0,0];
        for(var i = 0; i < initialSubSkillExperiences.length; i++) {
          initialSubSkillExperiences[i] = userBefore.subSkills[i].experience;
        }

        TwitterService.addTweets(userBefore._id, Common.USER.twitter.screenName, tweets, Common.logData, function() {
          User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {

            // Verify Twitter experience is updated
            Assert.strictEqual(userAfter.skill.experience, initialExperience + addedExperience);

            // Verify Twitter subskills are updated
            for(var i = 0; i < subSkillExperiences.length; i++) {
              if(subSkillExperiences[i] > 0) {
                Assert.strictEqual(userAfter.subSkills[i].experience, initialSubSkillExperiences[i] + subSkillExperiences[i]);
              }
            }

            // Verify tweets are in database
            (function checkTweets(i) {
              Tweet.findTweet(tweetIDs[i], Common.logData, function(returnedTweet) {
                Assert.ok(returnedTweet);
                returnedTweet.length.should.be.above(0);
                i++;
                if(i < tweetIDs.length) {
                  checkTweets(i);
                } else {
                  done();
                }
              });
            })(0); // Pass i as 0
          });
        });
      });
    });
  });

  // addUserSecretToken
  it("should add user's secret token to database -- addUserSecretToken()", function(done) {
    this.timeout(Common.TIMEOUT);

    // Generate sample secretToken
    TwitterInterfaceService.getOAuthRequestToken(Common.logData, function(token, secretToken) {

        // Function should rollback due to invalid user ID
        TwitterService.addUserSecretToken('', secretToken, Common.logData, function(){}, function() {

          // Get user's _id from database
          User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

            // Should add user's secret token to database successfully
            TwitterService.addUserSecretToken(user._id, secretToken, Common.logData, function() {

              // Verify user's secret token was updated
              User.getTwitterTokens(user._id, Common.logData, function(tokens) {
                Assert.strictEqual(tokens.secretToken, secretToken);
                done();
              });
            }, function(){});
          });
        });
    }, function(){});
  });

  // checkExistingAccessToken
  it('should return true if access token exists and false otherwise -- checkExistingAccessToken()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Generate test token
    TwitterInterfaceService.getOAuthRequestToken(Common.logData, function(token, secretToken) {

      TwitterService.checkExistingAccessToken(token, Common.logData, function(doesExist0) {
        Assert.strictEqual(doesExist0, false);

        // Get user's access token
        User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
          User.getTwitterTokens(user._id, Common.logData, function(tokens) {
            TwitterService.checkExistingAccessToken(tokens.accessToken, Common.logData, function(doesExist1) {
              Assert.strictEqual(doesExist1, true);
              done();
            });
          });
        });
      });
    }, function(){});
  });

  // getDashboardDisplayData
  it('should return dashboard display data -- getDashboardDisplayData()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Valid targetUsername
    TwitterService.getDashboardDisplayData(Common.USER.username, Common.logData, function(data0) {

      Assert.ok(data0.user);
      Assert.ok(data0.user.profileImg);
      Assert.ok(data0.user.skill);
      Assert.ok(data0.user.subSkills);
      Assert.ok(data0.recentActions);
      data0.recentActions.length.should.be.above(0);

      // Invalid target
      TwitterService.getDashboardDisplayData('username', Common.logData, function(data1){
        Assert.strictEqual(data1.errorImageUrl, 'image/avatar-medium.png');
        done();
      }, function(){});
    }, function(){});
  });

  // getQueueData
  it('should return queue data for a given a user id and screenName -- getQueueData()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid userId
    TwitterService.getQueueData('', Common.USER.twitter.screenName, Common.logData, function(){}, function() {

      // Get user's id
      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        User.getTwitterTokens(user._id, Common.logData, function(tokens) {

          // Invalid screenName
          TwitterService.getQueueData(user._id.toString(), '', Common.logData, function(){}, function(){

            // Create user id that doesnt exist
            var changedID = user._id.toString();
            for(var i = 0; i < changedID.length; i++) {
              if(changedID[i] != '1') {
                changedID = changedID.substring(0, i) + '1' + changedID.substring(i+1);
                break;
              }
            }

            // Invalid tokens - userId doesnt exists
            TwitterService.getQueueData(changedID, Common.USER.twitter.screenName, Common.logData, function(){}, function() {

              // UserId exists && screenName doesnt exist
              TwitterService.getQueueData(user._id.toString(), 'screenName', Common.logData, function(){}, function() {

                // UserId exists && screeName exists
                TwitterService.getQueueData(user._id.toString(), Common.USER.twitter.screenName, Common.logData, function(queueData) {
                  Assert.ok(queueData.tweetQueueData);
                  Assert.strictEqual(queueData.tweetQueueData.userId.toString(), user._id.toString());
                  Assert.strictEqual(queueData.tweetQueueData.screenName, user.twitter.screenName);
                  Assert.strictEqual(queueData.tweetQueueData.accessToken, tokens.accessToken);
                  Assert.strictEqual(queueData.tweetQueueData.secretAccessToken, tokens.secretAccessToken);

                  Assert.ok(queueData.mentionQueueData);
                  Assert.strictEqual(queueData.mentionQueueData.userId.toString(), user._id.toString());
                  Assert.strictEqual(queueData.mentionQueueData.screenName, user.twitter.screenName);
                  Assert.strictEqual(queueData.mentionQueueData.accessToken, tokens.accessToken);
                  Assert.strictEqual(queueData.mentionQueueData.secretAccessToken, tokens.secretAccessToken);
                  done();
                }, function(){})
              });
            });
          });
        });
      });
    });
  });

  // getSkillActivity
  it('should return skill activity for a user username, skill, and tweetId -- getSkillActivity()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid username
    TwitterService.getSkillActivity('', 'Augeo', '0', Common.logData, function(){}, function() {

      // Invalid skills
      TwitterService.getSkillActivity(Common.USER.username, 'invalidSkill', '0', Common.logData, function(){}, function() {

        // Invalid tweetId
        TwitterService.getSkillActivity(Common.USER.username, 'Augeo', '', Common.logData, function(){}, function() {

          // Valid input - no max
          TwitterService.getSkillActivity(Common.USER.username, 'Augeo', '9999999999999999999999999999999', Common.logData, function(data0) {
            Assert.ok(data0.activity);
            data0.activity.length.should.be.above(0);
            var maxId = data0.activity[0].tweetId;

            // Valid input - max tweet ID
            TwitterService.getSkillActivity(Common.USER.username, 'Augeo', maxId, Common.logData, function(data1) {
              Assert.ok(data1.activity);
              data1.activity.length.should.be.above(0);
              Assert.notStrictEqual(data1.activity[0].tweetId, maxId);
              done();
            }, function(){});
          }, function(){});
        });
      });
    });
  });

  // getUsers
  it('should return all users twitter IDs from Augeo DB -- getUsers()', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterService.getUsers(Common.logData, function(users) {
      users.length.should.be.above(0);
      for(var i = 0; i < users.length; i++) {
        Assert.ok(users[i].twitter.twitterId);
        users[i].twitter.twitterId.length.should.be.above(0);
      };
    });

    done();
  });

  // getUserSecretToken
  it('should return users secret token -- getUserSecretToken()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid session - missing user._id
    TwitterService.getUserSecretToken(null, Common.logData, function(){}, function() {

      // Valid session- user ID doesn't exists
      TwitterService.getUserSecretToken('0', Common.logData, function(){}, function() {

        // Valid session
        User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

          var userID = user._id.toString();

          TwitterService.getUserSecretToken(userID, Common.logData, function(secretToken) {
            Assert.strictEqual(secretToken.length, 32);
            done();
          }, function(){});
        });
      });
    });
  });

  // removeInvalidUser
  it('should remove user from database with a specified username -- removeInvalidUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    var invalidUser = {
      _id: '001',
      firstName: 'blah',
      lastName: 'blah blah',
      username: 'blahblahblah',
      password: 'blahblah'
    }

    var request = {
      session: {
        user: invalidUser
      }
    };

    // Verify user to be added is not in DB
    User.getUserWithUsername(invalidUser.username, Common.logData, function(user0) {
      Should.not.exist(user0);

      // Add invalid user
      User.add(invalidUser, Common.logData, function() {

        // Verify new user in db
        User.getUserWithUsername(invalidUser.username, Common.logData, function(user1) {
          Assert.strictEqual(user1.firstName, invalidUser.firstName);

          // Remove invalid users
          UserService.removeUser(request.session.user.username, Common.logData, function(user2) {
            Assert.strictEqual(user2.firstName, invalidUser.firstName)

            // Verify user is no longer in db
            User.getUserWithUsername(invalidUser.username, Common.logData, function(user3) {
              Should.not.exist(user3);
              done();
            });
          });
        })
      });
    });
  });

  it('should remove tweet and update users experience -- removeTweet()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Determine initial skill experience
    var experience = 0;
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user0) {
      experience = user0.skill.experience;

      // Verify tweet exists
      Tweet.findTweet(Common.rawStandardTweet.id_str, Common.logData, function(returnedTweet0) {
        Assert.strictEqual(returnedTweet0[0].tweetId, Common.rawStandardTweet.id_str);
        experience -= returnedTweet0[0].experience;

        var tweetData = {
          id_str: Common.rawStandardTweet.id_str,
          user_id_str: Common.rawStandardTweet.user.id_str
        }

        // Remove tweet
        TwitterService.removeTweet(tweetData, Common.logData, function(classification0) {

          // Verify tweet was removed
          Tweet.findTweet(Common.rawStandardTweet.id_str, Common.logData, function(returnedTweet1) {
            Assert.strictEqual(0, returnedTweet1.length);

            // Verify experience was removed from twitter skill
            User.getUserWithUsername(Common.USER.username, Common.logData, function(user1) {
              Assert.strictEqual(user1.skill.experience, experience);
              done();
            });
          });
        });
      });
    });
  });