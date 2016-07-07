
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
  /* Description: Handles logic interfacing with the TWEET and MENTION       */
  /*              collections                                                */
  /***************************************************************************/

  // Required files
  var Mongoose = require('mongoose');
  var AugeoDB = require('../model/database');

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var TwitterUtility = require('../utility/twitter-utility');
  var TwitterValidator = require('../validator/twitter-validator');

  // Schemas
  require('../model/schema/TWEET');
  require('../model/schema/USER');
  require('../model/schema/MENTION');

  // Constants
  var USERS_PER_PAGE = 25;
  var ACTIVITY_PER_PAGE = 20;

  // Global variables
  var User = AugeoDB.model('User');
  var Tweet = AugeoDB.model('Tweet');
  var Mention = AugeoDB.model('Mention');

  exports.addAction = function(action, tweet, mention, callback) {

    Tweet.findTweet(action.tweetId, function(returnedTweet) {

      // Make sure tweet is unique
      if(returnedTweet.length === 0) {

        // Find twitterId for actioner
        User.getUserWithScreenName(action.actionerScreenName, function(actioner) {

          // Find twitterId for actionee
          User.getUserWithScreenName(action.actioneeScreenName, function(actionee) {

            // Update twitter skill data
            if(actioner) {
              var actionerExperience = getTwitterExperience(tweet, action.actionerScreenName);
              User.updateTwitterSkillData(actioner._id, actionerExperience, function() {
                if(actionee) {
                  updateActionee(actionee, action, tweet, mention, callback);
                } else {
                  callback(tweet.classification);
                }
              });
            } else if(actionee) {
              updateActionee(actionee, action, tweet, mention, callback);
            }

            if(actioner || actionee) {
              // Insert tweets into tweet table
              Tweet.addTweet(tweet, function() {});
            }
          }); // End getUserWithScreenName for actionee
        }); // End getUserWithScreenName for actioner
      }
    }); // End findTweet
  };

  // Add mentions and their respective tweets to the given user
  exports.addMentions = function(userId, screenName, userMentionTweets, userMentions, callback) {

    // Add the user's mentionTweets to the TWEET table
    Tweet.addTweets(userMentionTweets, function() {}); // End addTweets

    // Add the user's mentions to the Mention table
    Mention.addMentions(userMentions, function() {}); // End addMentions

    // Calculate experience from the user's mentionTweets
    var isMention = true;
    var twitterExperience = calculateTwitterExperience(userMentionTweets, screenName, isMention);

    // Update user's Twitter experience
    User.updateTwitterSkillData(userId, twitterExperience, function() {
      callback();
    }); // End updateTwitterSkillData
  };

  // Add tweets to the given user
  exports.addTweets = function(userId, screenName, userTweets, callback) {

    // Add the user's tweets to the TWEET table
    Tweet.addTweets(userTweets, function() {}); // End addTweets

    // Determine experience from tweets
    var twitterExperience = calculateTwitterExperience(userTweets, screenName);

    // Update user's Twitter experience
    User.updateTwitterSkillData(userId, twitterExperience, function() {
      callback();
    }); // End updateTwitterSkillData
  };

  exports.addUserSecretToken = function(session, secretToken, callback, rollback) {

    if(TwitterValidator.isSessionValid(session)) {
      User.addSecretToken(session.user._id, secretToken, function(success) {
        if(success) {
          callback();
        } else {
          rollback();
        }
      });
    } else {
      rollback();
    }
  }

  exports.connectToTwitter = function(restQueue, streamQueue, callback) {
    // Get all users twitterId's
    exports.getUsers(function(users) {

      if(users.length > 0) {

        var streamQueueData = {
          action: "Open",
          data: users,
          callback: function(tweetData) {
            var queueData = {};
            queueData.action = 'Add';
            queueData.data = tweetData;
            streamQueue.addAction(queueData, function(){});
          },
          removeCallback: function(tweetData) {
            var queueData = {};
            queueData.action = 'Remove';
            queueData.data = tweetData;
            streamQueue.addAction(queueData, function() {});
          },
          connectedCallback: function() {
            restQueue.addAllUsersToQueues('ALL', function(){});
          }
        }

        streamQueue.openStream(streamQueueData, function(){}); // End openStream
      }
      callback();
    });
  };

  exports.checkExistingAccessToken = function(accessToken, callback, rollback) {
    User.checkExistingAccessToken(accessToken, function(existingAccessToken) {

      if(existingAccessToken != undefined) {
        callback(existingAccessToken);
      } else {
        rollback();
      }
    });
  };

  exports.getAllUsersQueueData = function(callback) {
    User.getAllUsersTwitterQueueData(callback);
  };

  exports.getLatestMentionTweetId = function(screenName, callback) {
    Mention.getLatestMentionTweetId(screenName, callback);
  };

  exports.getLatestTweetId = function(screenName, callback) {
    Tweet.getLatestTweetId(screenName, callback);
  };

  exports.getCompetitors = function(username, skill, callback, rollback) {

    if(TwitterValidator.isSkillValid(skill) && AugeoValidator.isUsernameValid(username)) {

      User.doesUsernameExist(username, function(userExists) {

        if(!userExists) {
          getCompetitorsWithRankPrivate(1, USERS_PER_PAGE, skill, callback);
        } else {

          // Get users skill rank
          User.getSkillRank(username, skill, function(rank) {

            // Divisor = Users rank divided by USERS_PER_PAGE.
            var divisor;
            if(rank % USERS_PER_PAGE == 0) {
              divisor = rank/USERS_PER_PAGE -1;
            } else {
              divisor = Math.floor(rank/USERS_PER_PAGE);
            }

            var startRank = divisor * USERS_PER_PAGE + 1;
            var endRank = (divisor + 1) * USERS_PER_PAGE;

            // Get users with skill rank greater than or equal to 25*Divisor and less than 25*(Divisor+1)
            getCompetitorsInPage(skill, startRank, endRank, callback);
          });
        }

      });
    } else {
      rollback();
    }
  };

  exports.getCompetitorsWithRank = function(startRank, endRank, skill, callback, rollback) {

    if(AugeoValidator.isNumberValid(startRank) && AugeoValidator.isNumberValid(endRank) && TwitterValidator.isSkillValid(skill)) {
      getCompetitorsWithRankPrivate(startRank, endRank, skill, callback);
    } else {
      rollback();
    }
  };

  exports.getNumberUsers = function(callback) {
    User.getNumberUsers(callback);
  };

  // Format necessary data to display on users profile
  exports.getProfileDisplayData = function(username, targetUsername, callback, rollback) {

    var errorImageUrl = 'image/logo.png';

    if(targetUsername && AugeoValidator.isUsernameValid(targetUsername)) {
      User.doesUsernameExist(targetUsername, function(targetUsernameExists) {

        if(targetUsernameExists) {
          getProfileDisplayDataPrivate(targetUsername, callback);
        } else {

          var errorData = {
            errorImageUrl: errorImageUrl
          };

          callback(errorData);
        }
      });
    } else {
      if(AugeoValidator.isUsernameValid(username)) {

        User.doesUsernameExist(username, function(usernameExists) {

          if(usernameExists) {
            getProfileDisplayDataPrivate(username, callback);
          } else {

            var errorData = {
              errorImageUrl: errorImageUrl
            }

            callback(errorData);
          }
        });
      } else {
        rollback();
      }
    }
  };

  exports.getQueueData = function(userId, screenName, callback, rollback) {

    if (AugeoValidator.isMongooseObjectIdValid(userId) && TwitterValidator.isScreenNameValid(screenName)) {

      // Get user's access tokens
      User.getTokens(userId, function(tokens) {

        if(tokens) {
          User.checkExistingTwitterUser(screenName, function(userExists) {

            if(userExists) {
              var accessToken = tokens.accessToken;
              var secretAccessToken = tokens.secretAccessToken;

              var queueData = {
                tweetQueueData: {
                  userId: new Mongoose.Types.ObjectId(userId),
                  screenName: screenName,
                  accessToken: accessToken,
                  secretAccessToken: secretAccessToken,
                  isNewUser: true
                },

                mentionQueueData: {
                  userId: new Mongoose.Types.ObjectId(userId),
                  screenName: screenName,
                  accessToken: accessToken,
                  secretAccessToken: secretAccessToken,
                  isNewUser: true
                }
              }
              callback(queueData);
            } else {
              rollback();
            }
          });
        } else {
          rollback();
        }
      });
    } else {
      rollback();
    }
  };

  exports.getSkillActivity = function(username, skill, tweetId, callback, rollback) {

    if(AugeoValidator.isUsernameValid(username)) {

      User.getUserWithUsername(username, function(user) {

        if(user) {
          var screenName = user.twitter.screenName;
          Mention.getMentions(screenName, function (mentionTweetIds) {

            if (TwitterValidator.isSkillValid(skill) && AugeoValidator.isNumberValid(tweetId)) {

              Tweet.getSkillActivity(screenName, mentionTweetIds, skill, ACTIVITY_PER_PAGE, tweetId, function (tweets) {

                var data = {
                  activity: tweets
                }

                callback(data);
              });
            } else {
              rollback();
            }
          });
        } else {
          rollback();
        }
      });
    } else {
      rollback();
    }
  };

  exports.getTwitterSkills = function() {
    return TwitterUtility.getSubSkills();
  };

  // Call DB to get all users Twitter Id's
  exports.getUsers = function(callback) {
    User.getUsers(callback);
  };

  exports.getUserSecretToken = function(session, callback, rollback) {
    if(TwitterValidator.isSessionValid(session)) {
      User.getSecretToken(session.user._id, function(oauthSecretToken) {
        if(oauthSecretToken) {
          callback(oauthSecretToken);
        } else {
          rollback();
        }
      });
    } else {
      rollback();
    }
  }

  // Call DB to check if user is a member
  exports.isMember = function(userId, callback){

    if(AugeoValidator.isMongooseObjectIdValid(userId)) {
      User.isMember(userId, callback);
    } else {
      callback(false);
    }
  };

  // Call DB to remove all users with an undefined Twitter Id
  exports.removeInvalidUser = function(session, callback) {
    if(TwitterValidator.isSessionValid(session)) {
      User.remove(session.user.email, callback);
    }
  };

  // TODO: Complete this
  // Current logic deletes tweet and updates user experience
  // Need to loop through mentionees of tweet and remove mentions from Mention table and update mentionees experience
  // Since stream logic can only detect replies, need to only update experience for deleted entries for replies or any
  // mention before the date of signing up with Augeo.
  // Need to update tests for TwitterTestInterface
  exports.removeTweet = function(tweetData, callback) {

    // Get tweet to be removed from database
    Tweet.findTweet(tweetData.id_str, function(tweet) {

      var tweetExperience = tweet[0].experience * -1;
      var classification = tweet[0].classification;

      // Remove tweet
      Tweet.removeTweet(tweetData.id_str, function() {

        // Set subskills experience
        var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills());
        subSkillsExperience[classification] += tweetExperience;

        var experience = {
          mainSkillExperience: tweetExperience,
          subSkillsExperience: subSkillsExperience
        };

        // Get User's ID
        User.getUserWithTwitterId(tweetData.user_id_str, function(user) {

          // Update users experience
          User.updateTwitterSkillData(user._id, experience, function() {
            callback(classification);
          });
        });
      });
    });
  };

  // Call DB to set user's member flag to true
  exports.setMember = function(userId, callback) {
    User.setMember(userId, callback);
  };

  exports.updateSubSkillRanks = function(subSkill, callback) {

    // Get the number of users
    User.getNumberUsers(function(numUsers) {
      var rank = 0;
      User.getSubSkillRanks(subSkill, function(docs) {
        docs.forEach(function(p){
          rank +=1;
          p.twitter.subSkills[0].rank = rank;
          if (numUsers == rank) {
            User.updateSubSkillRank(p, rank, TwitterUtility.getSkillIndex(subSkill), callback);
          } else {
            User.updateSubSkillRank(p, rank, TwitterUtility.getSkillIndex(subSkill));
          }
        });
      });
    });
  };

  // Call DB to update user's twitter information
  exports.updateTwitterInfo = function(userId, userData, callback, rollback) {

    // Validate userId
    if(AugeoValidator.isMongooseObjectIdValid(userId)) {

      // Set user's ranks to be number of users
      User.getNumberUsers(function(numUsers) {

        // Set Twitter skill to number of users
        userData.skill.rank = numUsers;

        // Loop through user data and set ranks
        var subSkills = userData.subSkills;
        for(var i = 0; i < subSkills.length; i++) {
          subSkills[i].rank = numUsers;
        }

        User.updateTwitterInfo(userId, userData, callback);
      });
    } else {
      rollback();
    }
  };

  exports.updateTwitterRanks = function(callback) {

    // Get the number of users to know when saves are complete
    User.getNumberUsers(function(numUsers) {
      var rank = 0;
      User.getTwitterRanks(function(docs) {
        docs.forEach(function(p){
          rank +=1;
          p.twitter.skill.rank = rank;

          if(rank == numUsers) {
            User.saveDocument(p,callback);
          } else {
            User.saveDocument(p);
          }
        });
      });
    });
  }

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  // Calculate Twitter skill experience based on tweets and mentions
  var calculateTwitterExperience = function(tweets, screenName, isMention) {

    var mainSkillExperience = 0;
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills());
    for(var i = 0; i < tweets.length; i++) {
      var tweet = tweets[i];

      var experienceGained = 0;

      if(isMention) {
        experienceGained = TwitterUtility.getMentionExperience();
      } else {
        experienceGained = tweet.experience;
      }

      // Add tweet experience to mainSkill
      mainSkillExperience += experienceGained;

      // Add experience to subSkill
      subSkillsExperience[tweet.classification] += experienceGained;
    }

    var experience = {
      mainSkillExperience: mainSkillExperience,
      subSkillsExperience: subSkillsExperience
    }

    return experience;
  };

  var getCompetitorsInPage = function(skill, startRank, endRank, callback) {

    User.getCompetitorsInPage(skill, startRank, endRank, function(competitors) {
      var users = new Array();
      for(var i = 0; i < competitors.length; i++) {

        var competitor;
        if(skill === 'Twitter') {
          competitor = competitors[i].twitter.skill;
        } else {
          competitor = competitors[i].twitter.subSkills[0];
        }

        var user = {
          username: competitors[i].username,
          twitterScreenName: competitors[i].twitter.screenName,
          rank: competitor.rank,
          level: competitor.level,
          experience: competitor.experience
        };

        users.push(user);
      }

      callback(users);
    });
  };

  var getCompetitorsWithRankPrivate = function(startRank, endRank, skill, callback) {
    startRank = parseInt(startRank);
    var endRank = parseInt(endRank);

    // Get max rank
    User.getMaxRank(skill, function(maxRank) {

      if(startRank > maxRank) {
        endRank = startRank-1;

        var divisor = Math.floor(endRank/USERS_PER_PAGE)
        startRank = divisor*USERS_PER_PAGE+1;
      }

      if(endRank > maxRank) {
        endRank = maxRank;
      }

      getCompetitorsInPage(skill, startRank, endRank, callback);

    });
  };

  var getProfileDisplayDataPrivate = function(username, callback) {

    User.getUserWithUsername(username, function(user) {

      var mainSkill = user.twitter.skill;
      var mainSkillDisplay = {
        name: 'Twitter',
        experience: mainSkill.experience,
        level: AugeoUtility.calculateLevel(mainSkill.experience),
        imageLink: mainSkill.imageLink,
        imageSrc: mainSkill.imageSrc,
        startExperience: AugeoUtility.getLevelStartExperience(mainSkill.level),
        endExperience: AugeoUtility.getLevelEndExperience(mainSkill.level),
        levelProgress: AugeoUtility.calculateLevelProgress(mainSkill.level, mainSkill.experience)
      }

      var subSkills = user.twitter.subSkills;
      var displaySkills = new Array();
      for(var i = 0; i < subSkills.length; i++) {
        var subSkill = subSkills[i];

        subSkillDisplay = {
          name: subSkill.name,
          glyphicon: subSkill.glyphicon,
          experience: subSkill.experience,
          level: subSkill.level,
          _id: subSkill._id ,
          id: subSkill.name.toLowerCase(),
          startExperience: AugeoUtility.getLevelStartExperience(subSkill.level),
          levelProgress: AugeoUtility.calculateLevelProgress(subSkill.level, subSkill.experience),
          endExperience: AugeoUtility.getLevelEndExperience(subSkill.level)
        }
        displaySkills.push(subSkillDisplay);
      }

      Mention.getMentions(user.twitter.screenName, function(mentionTweetIds) {
        Tweet.getSkillActivity(user.twitter.screenName, mentionTweetIds, null, 10, null, function(tweets) {

          var displayData = {
            profileData: {
              'profileImageUrl': user.twitter.profileImageUrl,
              'skill': mainSkillDisplay,
              'subSkills': displaySkills
            },
            recentActions: tweets
          };

          callback(displayData);
        });
      });
    });
  };

  // Calculate experience from tweet
  var getTwitterExperience = function(tweet, userName, isRetweet) {

    var tweetExperience = TwitterUtility.getExperience(tweet, userName, isRetweet);

    // Set subskills experience
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills());
    subSkillsExperience[tweet.classification] += tweetExperience;

    return {
      mainSkillExperience: tweetExperience,
      subSkillsExperience: subSkillsExperience
    };
  };

  // Update actionee's information based off of tweet and mention
  var updateActionee = function(actionee, action, tweet, mention, callback) {
    // Get tweet experience
    var actioneeExperience = getTwitterExperience(tweet, action.actionerScreenName, action.isRetweet);

    var tweetId;
    if(action.isRetweet) {

      // Increment retweet count
      Tweet.incrementRetweetCount(action.retweetId, function() {});

      // Get tweetId to update tweet's experience
      tweetId = action.retweetId;
    } else { // Logic for a reply

      // Get tweetId to update tweets's experience
      tweetId = action.replyId;

      Mention.addMention(mention, function() {});
    } // End reply to else

    // Update actionee's Tweet experience
    Tweet.updateExperience(tweetId, actioneeExperience, function(){});

    User.updateTwitterSkillData(actionee._id, actioneeExperience, function() {
      callback(tweet.classification);
    });
  };
