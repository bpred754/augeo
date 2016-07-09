
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
  var Mongoose = require('mongoose');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var AugeoUtility = require('../../../src/utility/augeo-utility');
  var Common = require('../common');
  var SessionValidator = require('../../../src/validator/session-validator');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterService = require('../../../src/service/twitter-service');
  var TwitterUtility = require('../../../src/utility/twitter-utility');

  // Global variables
  var User = AugeoDB.model('User');
  var Tweet = AugeoDB.model('Tweet');
  var Mention = AugeoDB.model('Mention');

  // updateTwitterInfo
  it("should add Test Tester's Twitter information to database entry -- updateTwitterInfo()", function(done) {
    this.timeout(Common.TIMEOUT);

    // Get Test Tester's user id from database
    User.getUserWithEmail(Common.USER.email, function(user) {

      Assert.ok(user._id);
      var userId = user._id.toString();

      // Get Test Tester's twitter information from database
      var twitterMessenger = '';
      TwitterInterfaceService.getTwitterUser(twitterMessenger, Common.USER.twitter.screenName, function(userData) {

        Assert.ok(userData.twitterId);
        Assert.strictEqual(userData.name, Common.USER.fullName);

        userData.accessToken = Common.USER.twitter.accessToken;
        userData.secretAccessToken = Common.USER.twitter.secretAccessToken;

        TwitterService.updateTwitterInfo(userId, userData, function() {

          // Retrieve Test Tester again from database to verify information was updated
          User.getUserWithEmail(Common.USER.email, function(userAfterUpdate) {

            Assert.strictEqual(userAfterUpdate.firstName, Common.USER.firstName);
            Assert.strictEqual(userAfterUpdate.lastName, Common.USER.lastName);
            Assert.strictEqual(userAfterUpdate.email, Common.USER.email);
            Assert.strictEqual(userAfterUpdate.twitter.accessToken, Common.USER.twitter.accessToken);
            Assert.strictEqual(userAfterUpdate.twitter.secretAccessToken, Common.USER.twitter.secretAccessToken);
            Assert.strictEqual(userAfterUpdate.twitter.twitterId, Common.USER.twitter.twitterId);
            Assert.strictEqual(userAfterUpdate.twitter.name, Common.USER.fullName);
            Assert.strictEqual(userAfterUpdate.twitter.screenName, Common.USER.twitter.screenName);
            Assert.strictEqual(userAfterUpdate.twitter.isMember, false);
            Assert.strictEqual(userAfterUpdate.twitter.skill.imageSrc, Common.USER.twitter.imageSrc);
            Assert.strictEqual(userAfterUpdate.twitter.skill.imageLink, Common.USER.twitter.imageLink);
            Assert.strictEqual(userAfterUpdate.twitter.skill.level, 1);
            Assert.strictEqual(userAfterUpdate.twitter.skill.experience, 0);

            var subSkills = userAfterUpdate.twitter.subSkills;
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
    var action0 = TwitterInterfaceService.extractAction(Common.rawStandardTweet);
    var tweet0 = TwitterInterfaceService.extractTweet(Common.rawStandardTweet);
    var mention0 = TwitterInterfaceService.extractReply(Common.rawStandardTweet);

    var experience = 0;
    // Determine initial skill experience
    User.getUserWithEmail(Common.USER.email, function(user0) {
      experience = user0.twitter.skill.experience;

      TwitterService.addAction(action0, tweet0, mention0, function(classification0) {

        // Verify tweet was added
        Tweet.findTweet(tweet0.tweetId, function(returnedTweet0) {
          Assert.strictEqual(returnedTweet0[0].experience, TwitterUtility.getTweetExperience() + TwitterUtility.getRetweetExperience());
          experience += returnedTweet0[0].experience;

          // Verify experience was added to twitter skill
          User.getUserWithEmail(Common.USER.email, function(user1) {
            Assert.strictEqual(user1.twitter.skill.experience, experience);

            // A tweet with Test Tester mentioned
            var action1 = TwitterInterfaceService.extractAction(Common.rawMentionOfTestUser);
            var tweet1 = TwitterInterfaceService.extractTweet(Common.rawMentionOfTestUser);
            var mention1 = TwitterInterfaceService.extractReply(Common.rawMentionOfTestUser);

            TwitterService.addAction(action1, tweet1, mention1, function(classification1) {

              // Verify tweet was added for user doing the mentioning
              Tweet.findTweet(tweet1.tweetId, function(returnedTweet1) {
                Assert.strictEqual(returnedTweet1[0].screenName, Common.ACTIONEE.twitter.screenName);
                Assert.strictEqual(returnedTweet1[0].experience, TwitterUtility.getTweetExperience());
                experience += returnedTweet1[0].experience;

                Mention.getMention(tweet1.tweetId, function(returnedMention0) {
                  Assert.strictEqual(returnedMention0[0].mentioneeScreenName, Common.USER.twitter.screenName);

                  // Verify experience was added to twitter skill
                  User.getUserWithEmail(Common.USER.email, function(user2) {
                    Assert.strictEqual(user2.twitter.skill.experience, experience);

                    // User retweets Test Tester's post
                    var action2 = TwitterInterfaceService.extractAction(Common.rawRetweetOfUser);
                    var tweet2 = TwitterInterfaceService.extractTweet(Common.rawRetweetOfUser);
                    var mention2 = TwitterInterfaceService.extractReply(Common.rawRetweetOfUser);

                    // Get original experience and retweet count of tweet to be retweeted
                    Tweet.findTweet(action2.retweetId, function(returnedTweet2) {
                      var originalTweetExperience = returnedTweet2[0].experience;
                      var originalRetweetCount = returnedTweet2[0].retweetCount;

                      TwitterService.addAction(action2, tweet2, mention2, function(classification2) {

                        // Verify tweet was added for user doing retweeting
                        Tweet.findTweet(tweet2.tweetId, function(returnedTweet3) {
                          Assert.strictEqual(returnedTweet3[0].screenName, Common.ACTIONEE.twitter.screenName);
                          Assert.strictEqual(returnedTweet3[0].experience, TwitterUtility.getTweetExperience());
                          experience += TwitterUtility.getRetweetExperience();

                          // Verify original tweet's experience and retweet count increased
                          Tweet.findTweet(action2.retweetId, function(returnedTweet4) {

                            Assert.strictEqual(returnedTweet4[0].experience, originalTweetExperience + TwitterUtility.getRetweetExperience());
                            Assert.strictEqual(returnedTweet4[0].retweetCount, originalRetweetCount + 1);

                            // Verify user's skill experience
                            User.getUserWithEmail(Common.USER.email, function(user3) {
                              Assert.strictEqual(user3.twitter.skill.experience, experience);
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
    TwitterInterfaceService.getMentions(twitterMessenger, Common.USER.twitter.screenName, function(error, mentionTweets, mentions) {

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

      User.getUserWithScreenName(Common.USER.twitter.screenName, function(userBefore) {
        var initialExperience = userBefore.twitter.skill.experience;
        TwitterService.addMentions(userBefore._id, Common.USER.twitter.screenName, mentionTweets, filteredMentions, function() {
          User.getUserWithScreenName(Common.USER.twitter.screenName, function(userAfter) {
            Assert.strictEqual(userAfter.twitter.skill.experience, initialExperience + count * TwitterUtility.getMentionExperience());

            // Asyncronous method calls in loop - Using Recursion
            (function checkMentions(i) {
              Mention.getMention(mentionIDs[i], function(returnedMention) {
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
              Tweet.findTweet(tweetIDs[j], function(returnedTweet) {
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
    TwitterInterfaceService.getTweets(twitterMessenger, function(error, tweets) {

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
        subSkillExperiences[TwitterUtility.getSkillIndex(classification)] += tweets[i].experience;
      };

      User.getUserWithEmail(Common.USER.email, function(userBefore) {
        var initialExperience = userBefore.twitter.skill.experience;

        var initialSubSkillExperiences = [0,0,0,0,0,0,0,0,0];
        for(var i = 0; i < initialSubSkillExperiences.length; i++) {
          initialSubSkillExperiences[i] = userBefore.twitter.subSkills[i].experience;
        }

        TwitterService.addTweets(userBefore._id, Common.USER.email, tweets, function() {
          User.getUserWithEmail(Common.USER.email, function(userAfter) {

            // Verify Twitter experience is updated
            Assert.strictEqual(userAfter.twitter.skill.experience, initialExperience + addedExperience);

            // Verify Twitter subskills are updated
            for(var i = 0; i < subSkillExperiences.length; i++) {
              if(subSkillExperiences[i] > 0) {
                Assert.strictEqual(userAfter.twitter.subSkills[i].experience, initialSubSkillExperiences[i] + subSkillExperiences[i]);
              }
            }

            // Verify tweets are in database
            (function checkTweets(i) {
              Tweet.findTweet(tweetIDs[i], function(returnedTweet) {
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

    var invalidSession = {
      user : Common.USER
    };

    // Generate sample secretToken
    TwitterInterfaceService.getOAuthRequestToken(function(token, secretToken) {

      // Function should rollback due to invalid session
      TwitterService.addUserSecretToken(invalidSession, secretToken, function() {}, function() {

        var invalidID = {
          user: {
            _id: '',
            firstName: Common.USER.firstName,
            lastName: Common.USER.lastName,
            email: Common.USER.email
          }
        };

        // Function should rollback due to invalid user ID
        TwitterService.addUserSecretToken(invalidID, secretToken, function(){}, function() {

          // Get user's _id from database
          User.getUserWithEmail(Common.USER.email, function(userBefore) {

            var validSession = invalidID;
            validSession.user._id = userBefore._id;

            // Should add user's secret token to database successfully
            TwitterService.addUserSecretToken(validSession, secretToken, function() {

              // Verify user's secret token was updated
              User.getUserWithEmail(Common.USER.email, function(userAfter) {
                Assert.strictEqual(userAfter.twitter.secretToken, secretToken);
                done();
              });
            }, function(){});
          });
        });
      });
    }, function(){});
  });

  // checkExistingAccessToken
  it('should return true if access token exists and false otherwise -- checkExistingAccessToken()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Generate test token
    TwitterInterfaceService.getOAuthRequestToken(function(token, secretToken) {

      TwitterService.checkExistingAccessToken(token, function(doesExist0) {
        Assert.strictEqual(doesExist0, false);

        // Get user's access token
        User.getUserWithEmail(Common.USER.email, function(user) {
          TwitterService.checkExistingAccessToken(user.twitter.accessToken, function(doesExist1) {
            Assert.strictEqual(doesExist1, true);
            done();
          });
        });
      });
    }, function(){});
  });

  // getCompetitors
  it('Should return competitors given a skill and a user -- getCompetitors()', function(done) {
    this.timeout(Common.TIMEOUT);

    var invalidUsername = '%%';
    TwitterService.getCompetitors(invalidUsername, 'Twitter', function(){}, function() {

      var invalidSkill = 'invalidSkill';
      TwitterService.getCompetitors(Common.USER.username, invalidSkill, function(){}, function() {

        // Get competitors for user that doesn't exist
        TwitterService.getCompetitors('invalid', 'Twitter', function(competitorsForInvalid) {

          var maxRank0 = 0;
          competitorsForInvalid.length.should.be.above(0);
          for(var i = 0; i < competitorsForInvalid.length; i++) {
            competitorsForInvalid[i].rank.should.be.above(maxRank0);
            Assert.ok(competitorsForInvalid[i].username);
            Assert.ok(competitorsForInvalid[i].rank);
            Assert.ok(competitorsForInvalid[i].experience);
            Assert.ok(competitorsForInvalid[i].level);
            maxRank0 = competitorsForInvalid[i].rank;
          }

          TwitterService.getCompetitors(Common.USER.username, 'Twitter', function(competitorsForValid) {

            var maxRank1 = 0;
            competitorsForValid.length.should.be.above(0);
            for(var i = 0; i < competitorsForValid.length; i++) {
              competitorsForInvalid[i].rank.should.be.above(maxRank1);
              Assert.ok(competitorsForValid[i].username);
              Assert.ok(competitorsForValid[i].rank);
              Assert.ok(competitorsForValid[i].experience);
              Assert.ok(competitorsForValid[i].level);
              maxRank1 = competitorsForInvalid[i].rank;
            }
            done();
          }, function(){});
        }, function(){});
      });
    });
  });


  // getCompetitorsWithRank
  it('should return competitors within a start and end rank -- getCompetitorsWithRank()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid start rank
    TwitterService.getCompetitorsWithRank('!', '5', 'Twitter', function(){}, function() {

      // Invalid end rank
      TwitterService.getCompetitorsWithRank('1', '%', 'Twitter', function(){}, function() {

        // Invalid skill
        TwitterService.getCompetitorsWithRank('1', '5', 'invalid', function(){}, function() {

          // Valid input
          TwitterService.getCompetitorsWithRank('1', '5', 'Twitter', function(users) {

            users.length.should.be.above(0);
            users.length.should.be.below(6);
            for(var i = 0; i < users.length; i++) {
              Assert.ok(users[i].username);
              Assert.ok(users[i].rank);
              Assert.ok(users[i].experience);
              Assert.ok(users[i].level);
              Assert.strictEqual(users[i].rank, i+1);
            }
            done();
          }, function(){});
        });
      });
    });
  });

  // getDashboardDisplayData
  it('should return dashboard display data -- getDashboardDisplayData()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Valid targetUsername && targetUserame doesn't exists
    var targetUsername = 'target';
    TwitterService.getDashboardDisplayData(Common.USER.username, targetUsername, function(data0) {
      Assert.strictEqual(data0.errorImageUrl, 'image/logo.png');

      // Valid targetUsername && targetUsername exists
      TwitterService.getDashboardDisplayData(Common.USER.username, Common.USER.username, function(data1) {

        Assert.ok(data1.profileData);
        Assert.ok(data1.profileData.profileImageUrl);
        Assert.ok(data1.profileData.skill);
        Assert.ok(data1.profileData.subSkills);
        Assert.ok(data1.recentActions);
        data1.recentActions.length.should.be.above(0);

        // Invalid target && valid userUsername && username doesn't exists
        TwitterService.getDashboardDisplayData('username', '', function(data2){

          Assert.strictEqual(data2.errorImageUrl, 'image/logo.png');

          // Invalid target && valid username && username exists
          TwitterService.getDashboardDisplayData(Common.USER.username, '', function(data3) {

            Assert.ok(data3.profileData);
            Assert.ok(data3.profileData.profileImageUrl);
            Assert.ok(data3.profileData.skill);
            Assert.ok(data3.profileData.subSkills);
            Assert.ok(data3.recentActions);
            data3.recentActions.length.should.be.above(0);

            // Invalid target and invalid username
            TwitterService.getDashboardDisplayData('', '', function(){}, function() {
              done();
            });
          }, function(){});
        }, function(){});
      }, function(){});
    }, function(){});
  });

  // getNumberUsers
  it('should return the number of users in the database', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterService.getNumberUsers(function(numberUsers) {
      Assert.ok(numberUsers);
      numberUsers.should.be.above(0);
      done();
    });
  });

  // getQueueData
  it('should return queue data for a given a user id and screenName -- getQueueData()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid userId
    TwitterService.getQueueData('', Common.USER.twitter.screenName, function(){}, function() {

      // Get user's id
      User.getUserWithEmail(Common.USER.email, function(user) {

        // Invalid screenName
        TwitterService.getQueueData(user._id.toString(), '', function(){}, function(){

          // Create user id that doesnt exist
          var changedID = user._id.toString();
          for(var i = 0; i < changedID.length; i++) {
            if(changedID[i] != '1') {
              changedID = changedID.substring(0, i) + '1' + changedID.substring(i+1);
              break;
            }
          }

          // Invalid tokens - userId doesnt exists
          TwitterService.getQueueData(changedID, Common.USER.twitter.screenName, function(){}, function() {

            // UserId exists && screenName doesnt exist
            TwitterService.getQueueData(user._id.toString(), 'screenName', function(){}, function() {

              // UserId exists && screeName exists
              TwitterService.getQueueData(user._id.toString(), Common.USER.twitter.screenName, function(queueData) {
                Assert.ok(queueData.tweetQueueData);
                Assert.strictEqual(queueData.tweetQueueData.userId.toString(), user._id.toString());
                Assert.strictEqual(queueData.tweetQueueData.screenName, user.twitter.screenName);
                Assert.strictEqual(queueData.tweetQueueData.accessToken, user.twitter.accessToken);
                Assert.strictEqual(queueData.tweetQueueData.secretAccessToken, user.twitter.secretAccessToken);

                Assert.ok(queueData.mentionQueueData);
                Assert.strictEqual(queueData.mentionQueueData.userId.toString(), user._id.toString());
                Assert.strictEqual(queueData.mentionQueueData.screenName, user.twitter.screenName);
                Assert.strictEqual(queueData.mentionQueueData.accessToken, user.twitter.accessToken);
                Assert.strictEqual(queueData.mentionQueueData.secretAccessToken, user.twitter.secretAccessToken);
                done();
              }, function(){})
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
    TwitterService.getSkillActivity('', 'Twitter', '0', function(){}, function() {

      // Invalid skills
      TwitterService.getSkillActivity(Common.USER.username, 'invalidSkill', '0', function(){}, function() {

        // Invalid tweetId
        TwitterService.getSkillActivity(Common.USER.username, 'Twitter', '', function(){}, function() {

          // Valid input - no max
          TwitterService.getSkillActivity(Common.USER.username, 'Twitter', '9999999999999999999999999999999', function(data0) {
            Assert.ok(data0.activity);
            data0.activity.length.should.be.above(0);
            var maxId = data0.activity[0].tweetId;

            // Valid input - max tweet ID
            TwitterService.getSkillActivity(Common.USER.username, 'Twitter', maxId, function(data1) {
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

    TwitterService.getUsers(function(users) {
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

    var invalidSession = {
      user: {
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName,
          email: Common.USER.email
      }
    };

    // Invalid session - missing user._id
    TwitterService.getUserSecretToken(invalidSession, function(){}, function() {


      var notExistentID = {
        user: {
          _id: '0',
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName,
          email: Common.USER.email
        }
      };

      // Valid session- user ID doesn't exists
      TwitterService.getUserSecretToken(notExistentID, function(){}, function() {


        // Valid session
        User.getUserWithEmail(Common.USER.email, function(user) {

          var userID = user._id.toString();
          var session = {
            user: {
              _id: userID,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }
          }

          TwitterService.getUserSecretToken(session, function(secretToken) {
            Assert.strictEqual(secretToken.length, 32);
            done();
          }, function(){});
        });
      });
    });
  });

  // setMember && isMember
  it('should return if the user is a member of not -- setMember() && isMember()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid Mongoose ID
    var invalidID = '%';
    TwitterService.isMember(invalidID, function(isMember0) {
      Assert.strictEqual(isMember0, false);

      // Valid MongooseID - user ID doesn't exists
      var nonExistentID = '123456789012345678901234';
      TwitterService.isMember(nonExistentID, function(isMember1) {
        Assert.strictEqual(isMember1, false);

        // Valid
        User.getUserWithEmail(Common.USER.email, function(user) {

          TwitterService.isMember(user._id.toString(), function(isMember2) {
            Assert.strictEqual(isMember2, false);

            // set USER with user that doesn't exist
            TwitterService.setMember(nonExistentID, function(isMember3) {
              Assert.strictEqual(isMember3, false);

              // Set USER as member
              TwitterService.setMember(user._id.toString(), function(isMember4) {
                Assert.strictEqual(isMember4, true);

                // Verify isMember
                TwitterService.isMember(user._id.toString(), function(isMember5) {
                  Assert.strictEqual(isMember5, true);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  // isUserDefined
  it('should return a boolean signifying if the session user is defined -- isUserDefined()', function(done) {
    this.timeout(Common.TIMEOUT);

    var nullRequest;
    Assert.strictEqual(SessionValidator.isUserDefined(nullRequest), false);

    var nullSession = {};
    Assert.strictEqual(SessionValidator.isUserDefined(nullSession), false);

    var nullUser = {
      session: {}
    };
    Assert.strictEqual(SessionValidator.isUserDefined(nullUser), false);

    var valid = {
      session: {
        user: Common.USER
      }
    };
    Assert.strictEqual(SessionValidator.isUserDefined(valid), true);

    done();
  });

  // removeInvalidUser
  it('should remove user from database with a specified email -- removeInvalidUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    var invalidUser = {
      _id: '001',
      firstName: 'blah',
      lastName: 'blah blah',
      email: 'blah@email.com',
      password: 'blahblah'
    }

    var session = {
      user: invalidUser
    };

    // Verify user to be added is not in DB
    User.getUserWithEmail(invalidUser.email, function(user0) {
      Should.not.exist(user0);

      // Add invalid user
      User.add(invalidUser, function() {

        // Verify new user in db
        User.getUserWithEmail(invalidUser.email, function(user1) {
          Assert.strictEqual(user1.firstName, invalidUser.firstName);

          // Remove invalid users
          TwitterService.removeInvalidUser(session, function(user2) {
            Assert.strictEqual(user2.firstName, invalidUser.firstName)

            // Verify user is no longer in db
            User.getUserWithEmail(invalidUser.email, function(user3) {
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
    User.getUserWithEmail(Common.USER.email, function(user0) {
      experience = user0.twitter.skill.experience;

      // Verify tweet exists
      Tweet.findTweet(Common.rawStandardTweet.id_str, function(returnedTweet0) {
        Assert.strictEqual(returnedTweet0[0].tweetId, Common.rawStandardTweet.id_str);
        experience -= returnedTweet0[0].experience;

        var tweetData = {
          id_str: Common.rawStandardTweet.id_str,
          user_id_str: Common.rawStandardTweet.user.id_str
        }

        // Remove tweet
        TwitterService.removeTweet(tweetData, function(classification0) {

          // Verify tweet was removed
          Tweet.findTweet(Common.rawStandardTweet.id_str, function(returnedTweet1) {
            Assert.strictEqual(0, returnedTweet1.length);

            // Verify experience was removed from twitter skill
            User.getUserWithEmail(Common.USER.email, function(user1) {
              Assert.strictEqual(user1.twitter.skill.experience, experience);
              done();
            });
          });
        });
      });
    });
  });

  // updateTwitterRanks & updateSubSkillRanks
  it('should update the skill and sub skill ranks for all users -- updateSubSkillRanks() & updateTwitterRanks()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Retrieve baseline skill for Common user
    User.getUserWithEmail(Common.USER.email, function(user0) {

      var baseSkillRank = user0.twitter.skill.rank;

      var baseIndex = 4;
      var general = user0.twitter.subSkills[baseIndex];
      var baseExperience = general.experience;
      var baseSubSkillRank = general.rank;

      baseSkillRank.should.be.above(0);
      baseExperience.should.be.above(0);
      baseSubSkillRank.should.be.above(0);

      Assert.ok(baseSkillRank);
      Assert.ok(baseIndex);
      Assert.ok(baseExperience);
      Assert.ok(baseSubSkillRank);

      var newUser = {
        firstName: Common.ACTIONEE.firstName,
        lastName: Common.ACTIONEE.lastName,
        email: Common.ACTIONEE.email,
        password: Common.ACTIONEE.password
      };

      // Verify new user is not in database
      User.getUserWithEmail(newUser.email, function(user1) {
        Should.not.exist(user1);

        // Add new user to database
        User.add(newUser, function(user2) {

          var newUserSubSkills = TwitterUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills()));

          var twitterData = {
            twitterId: Common.ACTIONEE.twitter.twitterId,
            name: Common.ACTIONEE.fullName,
            screenName: Common.ACTIONEE.twitter.screenName,
            profileImageUrl: Common.ACTIONEE.twitter.profileImageUrl,
            isMember: false,
            accessToken: Common.ACTIONEE.twitter.accessToken,
            secretAccessToken: Common.ACTIONEE.twitter.secretAccessToken,
            skill: TwitterUtility.getMainSkill(0),
            subSkills: newUserSubSkills
          };

          // Update new user's twitter information
          TwitterService.updateTwitterInfo(user2._id.toString(), twitterData, function() {

            // Verify new user's skill and subSkill rank is higher than Common.USER
            User.getUserWithEmail(Common.ACTIONEE.email, function(user3) {
              var newUserSkillRank = user3.twitter.skill.rank;
              var newUserSubSkillRank = user3.twitter.subSkills[baseIndex].rank;

              newUserSkillRank.should.be.above(baseSkillRank);
              newUserSubSkillRank.should.be.above(baseSubSkillRank);

              var updateSubSkillExperiences = AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills());
              updateSubSkillExperiences[TwitterUtility.getSubSkills()[baseIndex].name] = baseExperience*100;
              var updateExperience = {
                mainSkillExperience: baseExperience*100,
                subSkillsExperience: updateSubSkillExperiences
              }

              // Update new user's subSkill experience to be more than Common.USER - use User.updateTwitterSkillData
              User.updateTwitterSkillData(user3._id, updateExperience, function() {

                // Update Twitter ranks
                TwitterService.updateTwitterRanks(function() {

                  // Update sub skill ranks
                  TwitterService.updateSubSkillRanks(general.name, function() {

                    User.getUserWithEmail(Common.USER.email, function(user4) {

                      // Update baseline variables
                      baseSkillRank = user4.twitter.skill.rank;
                      baseSubSkillRank = user4.twitter.subSkills[baseIndex].rank;

                      // Verify new user's subSkill rank is lower than Common.USER
                      User.getUserWithEmail(Common.ACTIONEE.email, function(user5) {
                        user5.twitter.skill.rank.should.be.below(baseSkillRank);
                        user5.twitter.subSkills[baseIndex].rank.should.be.below(baseSubSkillRank);
                        done();
                      });
                    });
                  });
                });
              });
            });
          }, function(){});
        });
      });
    });
  });
