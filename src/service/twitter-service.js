
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
              User.updateSkillData(actioner._id, actionerExperience, function() {
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

    // Update user's experience
    User.updateSkillData(userId, twitterExperience, function() {
      callback();
    }); // End updateSkillData
  };

  // Add tweets to the given user
  exports.addTweets = function(userId, screenName, userTweets, callback) {

    // Add the user's tweets to the TWEET table
    Tweet.addTweets(userTweets, function() {}); // End addTweets

    // Determine experience from tweets
    var twitterExperience = calculateTwitterExperience(userTweets, screenName);

    // Update user's experience
    User.updateSkillData(userId, twitterExperience, function() {
      callback();
    }); // End updateSkillData
  };

  exports.addUserSecretToken = function(request, secretToken, callback, rollback) {

    if(AugeoValidator.isSessionValid(request)) {
      User.addTwitterSecretToken(request.session.user._id, secretToken, function(success) {
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
    User.checkExistingTwitterAccessToken(accessToken, function(existingAccessToken) {

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

  exports.getQueueData = function(userId, screenName, callback, rollback) {

    if (AugeoValidator.isMongooseObjectIdValid(userId) && TwitterValidator.isScreenNameValid(screenName)) {

      // Get user's access tokens
      User.getTwitterTokens(userId, function(tokens) {

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

  // Format necessary data to display on users dashboard
  exports.getDashboardDisplayData = function(username, targetUsername, callback, rollback) {

    var errorImageUrl = 'image/logo.png';

    if(targetUsername && AugeoValidator.isUsernameValid(targetUsername)) {
      User.doesUsernameExist(targetUsername, function(targetUsernameExists) {

        if(targetUsernameExists) {
          getDashboardDisplayDataPrivate(targetUsername, callback);
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
            getDashboardDisplayDataPrivate(username, callback);
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

  exports.getSkillActivity = function(username, skill, tweetId, callback, rollback) {

    if(AugeoValidator.isUsernameValid(username)) {

      User.getUserWithUsername(username, function(user) {

        if(user) {
          var screenName = user.twitter.screenName;
          Mention.getMentions(screenName, function (mentionTweetIds) {

            if (AugeoValidator.isSkillValid(skill) && AugeoValidator.isNumberValid(tweetId)) {

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

  // Call DB to get all users Twitter Id's
  exports.getUsers = function(callback) {
    User.getTwitterUsers(callback);
  };

  exports.getUserSecretToken = function(userId, callback, rollback) {
    User.getTwitterTokens(userId, function(tokens) {
      if(tokens && tokens.secretToken) {
        callback(tokens.secretToken);
      } else {
        rollback();
      }
    });
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
        var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS);
        subSkillsExperience[classification] += tweetExperience;

        var experience = {
          mainSkillExperience: tweetExperience,
          subSkillsExperience: subSkillsExperience
        };

        // Get User's ID
        User.getUserWithTwitterId(tweetData.user_id_str, function(user) {

          // Update users experience
          User.updateSkillData(user._id, experience, function() {
            callback(classification);
          });
        });
      });
    });
  };

  // Call DB to update user's twitter information
  exports.updateTwitterInfo = function(userId, userData, callback, rollback) {

    // Validate userId
    if(AugeoValidator.isMongooseObjectIdValid(userId)) {
      User.updateTwitterInfo(userId, userData, callback);
    } else {
      rollback();
    }
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  // Calculate Twitter skill experience based on tweets and mentions
  var calculateTwitterExperience = function(tweets, screenName, isMention) {

    var mainSkillExperience = 0;
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS);
    for(var i = 0; i < tweets.length; i++) {
      var tweet = tweets[i];

      var experienceGained = 0;

      if(isMention) {
        experienceGained = TwitterUtility.MENTION_EXPERIENCE;
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

  var getDashboardDisplayDataPrivate = function(username, callback) {

    User.getUserWithUsername(username, function(user) {

      var profileData = {
        username: username,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        profession: user.profession,
        profileImg: user.profileImg,
        website: user.website,
        description: user.description,
        twitterScreenName: user.twitter.screenName
      };

      var mainSkill = user.skill;
      var mainSkillDisplay = {
        name: 'Augeo',
        experience: mainSkill.experience,
        level: AugeoUtility.calculateLevel(mainSkill.experience),
        imageSrc: mainSkill.imageSrc,
        startExperience: AugeoUtility.getLevelStartExperience(mainSkill.level),
        endExperience: AugeoUtility.getLevelEndExperience(mainSkill.level),
        levelProgress: AugeoUtility.calculateLevelProgress(mainSkill.level, mainSkill.experience)
      }

      var subSkills = user.subSkills;
      var displaySkills = new Array();
      for(var i = 0; i < subSkills.length; i++) {
        var subSkill = subSkills[i];

        var subSkillDisplay = {
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
            dashboardData: {
              'user': profileData,
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
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS);
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

    User.updateSkillData(actionee._id, actioneeExperience, function() {
      callback(tweet.classification);
    });
  };
