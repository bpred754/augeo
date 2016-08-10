
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
  var Logger = require('../module/logger');
  var TwitterUtility = require('../utility/twitter-utility');
  var TwitterValidator = require('../validator/twitter-validator');

  // Constants
  var ACTIVITY_PER_PAGE = 20;
  var SERVICE = 'twitter-service';

  // Schemas
  require('../model/schema/augeo/user');
  require('../model/schema/twitter/tweet');
  require('../model/schema/twitter/user');

  // Global variables
  var Tweet = AugeoDB.model('TWITTER_TWEET');
  var TwitterUser = AugeoDB.model('TWITTER_USER');
  var User = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  exports.addAction = function(action, tweet, mention, logData, callback) {
    log.functionCall(SERVICE, 'addAction', logData.parentProcess, logData.username, {'action.actionerScreenName': (action)?action.actionerScreenName:'invalid',
      'tweet.tweetId':(tweet)?tweet.tweetId:'invalid', 'mention.mentioneeScreenName':(mention)?mention.mentioneeScreenName:'invalid'});

    Tweet.findTweet(action.tweetId, logData, function(returnedTweet) {

      // Make sure tweet is unique
      if(returnedTweet.length === 0) {

        // Find twitterId for actioner
        TwitterUser.getUserWithScreenName(action.actionerScreenName, logData, function(actioner) {

          // Find twitterId for actionee
          TwitterUser.getUserWithScreenName(action.actioneeScreenName, logData, function(actionee) {

            // Update twitter skill data
            if(actioner) {
              var actionerExperience = getTwitterExperience(tweet, action.actionerScreenName, null, logData);
              User.updateSkillData(actioner._id, actionerExperience, logData, function() {
                if(actionee) {
                  updateActionee(actionee, action, tweet, mention, logData, callback);
                } else {
                  callback(tweet.classification);
                }
              });
            } else if(actionee) {
              updateActionee(actionee, action, tweet, mention, logData, callback);
            }

            if(actioner || actionee) {
              // Insert tweets into tweet table
              Tweet.addTweet(tweet, logData, function() {});
            }
          }); // End getUserWithScreenName for actionee
        }); // End getUserWithScreenName for actioner
      }
    }); // End findTweet
  };

  // Add tweets to the given user
  exports.addTweets = function(userId, screenName, userTweets, areMentions, logData, callback) {
    log.functionCall(SERVICE, 'addTweets', logData.parentProcess, logData.username, {'userId':userId, 'screenName':screenName,
      'userTweets':(userTweets)?userTweets.length:'invalid'});

    // Add the user's tweets to the TWEET table
    Tweet.addTweets(userTweets, logData, function() {}); // End addTweets

    // Determine experience from tweets
    var twitterExperience = calculateTwitterExperience(userTweets, screenName, areMentions, logData);

    // Update user's experience
    User.updateSkillData(userId, twitterExperience, logData, function() {
      callback();
    }); // End updateSkillData
  };

  exports.addUserSecretToken = function(userId, secretToken, logData, callback, rollback) {
    log.functionCall(SERVICE, 'addUserSecretToken', logData.parentProcess, logData.username, {'userId':userId, 'secretToken':secretToken});


    TwitterUser.add(userId, secretToken, logData, function(success) {
      if(success) {
        callback();
      } else {
        rollback('Failed to add Twitter secret access token');
      }
    });
  };

  exports.connectToTwitter = function(restQueue, streamQueue, logData, callback) {
    log.functionCall(SERVICE, 'connectToTwitter', logData.parentProcess, logData.username, {'restQueue':(restQueue)?'valid':'invalid',
      'streamQueue':(streamQueue)?'valid':'invalid'});

    // Get all users twitterId's
    exports.getUsers(logData, function(users) {

      if(users.length > 0) {

        var streamQueueData = {
          action: 'Open',
          data: users,
          logData: logData,
          callback: function(tweetData) {
            var queueData = {};
            queueData.action = 'Add';
            queueData.data = tweetData;
            streamQueue.addAction(queueData, logData, function(){});
          },
          removeCallback: function(tweetData) {
            var queueData = {};
            queueData.action = 'Remove';
            queueData.data = tweetData;
            streamQueue.addAction(queueData, logData, function() {});
          },
          connectedCallback: function() {
            restQueue.addAllUsersToQueues('ALL', logData, function(){});
          }
        };

        streamQueue.openStream(streamQueueData, function(){}); // End openStream
      }
      callback();
    });
  };

  exports.checkExistingAccessToken = function(accessToken, logData, callback, rollback) {
    log.functionCall(SERVICE, 'checkExistingAccessToken', logData.parentProcess, logData.username, {'accessToken':accessToken});

    TwitterUser.checkExistingAccessToken(accessToken, logData, function(existingAccessToken) {

      if(existingAccessToken != undefined) {
        callback(existingAccessToken);
      } else {
        rollback('The retrieved existingAccessToken is undefined');
      }
    });
  };

  exports.getAllUsersQueueData = function(logData, callback) {
    log.functionCall(SERVICE, 'getAllUsersQueueData', logData.parentProcess, logData.username);

    TwitterUser.getAllQueueData(logData, callback);
  };

  // Format necessary data to display on users dashboard
  exports.getDashboardDisplayData = function(username, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getDashboardDisplayData', logData.parentProcess, logData.username, {'username':username});

    var errorImageUrl = 'image/avatar-medium.png';

    if(AugeoValidator.isUsernameValid(username, logData)) {
      User.doesUsernameExist(username, logData, function(usernameExists) {

        if(usernameExists) {
          User.getUserWithUsername(username, logData, function(user) {

            var userData = user.toJSON();
            userData.skill.name = 'Augeo';
            userData.skill.startExperience = AugeoUtility.getLevelStartExperience(userData.skill.level, logData); // TODO: Move to client?
            userData.skill.endExperience = AugeoUtility.getLevelEndExperience(userData.skill.level, logData); // TODO" Move to client?
            userData.skill.levelProgress = AugeoUtility.calculateLevelProgress(userData.skill.level, userData.skill.experience, logData); // TODO: Move to client?

            for(var i = 0; i < userData.subSkills.length; i++) {
              userData.subSkills[i].startExperience = AugeoUtility.getLevelStartExperience(userData.subSkills[i].level, logData); // TODO: Move to client?
              userData.subSkills[i].levelProgress = AugeoUtility.calculateLevelProgress(userData.subSkills[i].level, userData.subSkills[i].experience, logData); // TODO: Move to client?
              userData.subSkills[i].endExperience = AugeoUtility.getLevelEndExperience(userData.subSkills[i].level, logData); // TODO: Move to client?
            }

            var displayData = {
              user:userData
            };

            if(userData.twitter) {
              Tweet.getSkillActivity(userData.twitter.screenName, null, 10, null, logData, function(tweets) {
                displayData.recentActions = TwitterUtility.transformUserDisplayExperience(userData.twitter.screenName, tweets, logData);
                callback(displayData);
              });
            } else {
              callback(displayData);
            }
          });
        } else {

          var errorData = {
            errorImageUrl: errorImageUrl
          }
          callback(errorData);
        }
      });
    } else {
      rollback('Invalid username');
    }
  };

  exports.getLatestMentionTweetId = function(screenName, logData, callback) {
    log.functionCall(SERVICE, 'getLatestMentionTweetId', logData.parentProcess, logData.username, {'screenName':screenName});

    Tweet.getLatestMentionTweetId(screenName, logData, callback);
  };

  exports.getLatestTweetId = function(screenName, logData, callback) {
    log.functionCall(SERVICE, 'getLatestTweetId', logData.parentProcess, logData.username, {'screenName':screenName});

    Tweet.getLatestTweetId(screenName, logData, callback);
  };

  exports.getQueueData = function(userId, screenName, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getQueueData', logData.parentProcess, logData.username, {'userId':userId, 'screenName':screenName});

    if (AugeoValidator.isMongooseObjectIdValid(userId, logData) && TwitterValidator.isScreenNameValid(screenName, logData)) {

      // Get user's access tokens
      TwitterUser.getTokens(userId, logData, function(tokens) {

        if(tokens) {
          TwitterUser.doesUserExist(screenName, logData, function(userExists) {

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
              rollback('User does not exist');
            }
          });
        } else {
          rollback('User tokens do not exist');
        }
      });
    } else {
      rollback('Invalid input');
    }
  };

  exports.getSkillActivity = function(username, skill, tweetId, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getSkillActivity', logData.parentProcess, logData.username, {'username':username, 'skill':skill,
      'tweetId':tweetId});

    if(AugeoValidator.isUsernameValid(username, logData)) {

      User.getUserWithUsername(username, logData, function(user) {

        if(user) {
          var screenName = user.twitter.screenName;
          if (AugeoValidator.isSkillValid(skill, logData) && AugeoValidator.isNumberValid(tweetId, logData)) {
            Tweet.getSkillActivity(screenName, skill, ACTIVITY_PER_PAGE, tweetId, logData, function (tweets) {

              // Set callback data
              var data = {
                activity: TwitterUtility.transformUserDisplayExperience(screenName, tweets, logData)
              };

              callback(data);
            });
          } else {
           rollback(404, 'Invalid skill or tweetId');
          }
        } else {
          callback();
        }
      });
    } else {
      rollback(404, 'Invalid username');
    }
  };

  // Call DB to get all users Twitter Id's
  exports.getUsers = function(logData, callback) {
    log.functionCall(SERVICE, 'getUsers', logData.parentProcess, logData.username);

    TwitterUser.getUsers(logData, callback);
  };

  exports.getUserSecretToken = function(userId, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getUserSecretToken', logData.parentProcess, logData.username, {'userId':userId});

    TwitterUser.getTokens(userId, logData, function(tokens) {
      if(tokens && tokens.secretToken) {
        callback(tokens.secretToken);
      } else {
        rollback('Secret token retrieved is undefined');
      }
    });
  };

  // TODO: Complete this
  // Current logic deletes tweet and updates user experience
  // Need to loop through mentionees of tweet and remove mentions from Mention table and update mentionees experience
  // Since stream logic can only detect replies, need to only update experience for deleted entries for replies or any
  // mention before the date of signing up with Augeo.
  // Need to update tests for TwitterTestInterface
  exports.removeTweet = function(tweetData, logData, callback) {
    log.functionCall(SERVICE, 'removeTweet', logData.parentProcess, logData.username, {'tweetData.id_str':(tweetData)?tweetData.id_str:'invalid'});

    // Get tweet to be removed from database
    Tweet.findTweet(tweetData.id_str, logData, function(tweet) {

      var tweetExperience = tweet[0].experience * -1;
      var classification = tweet[0].classification;

      // Remove tweet
      Tweet.removeTweet(tweetData.id_str, logData, function() {

        // Set subskills experience
        var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, logData);
        subSkillsExperience[classification] += tweetExperience;

        var experience = {
          mainSkillExperience: tweetExperience,
          subSkillsExperience: subSkillsExperience
        };

        // Get User's ID
        TwitterUser.getUserWithTwitterId(tweetData.user_id_str, logData, function(user) {

          // Update users experience
          User.updateSkillData(user._id, experience, logData, function() {
            callback(classification);
          });
        });
      });
    });
  };

  exports.removeUser = function(augeoId, logData, callback) {
    log.functionCall(SERVICE, 'removeUser', logData.parentProcess, logData.username, {'augeoId': augeoId});
    TwitterUser.remove(augeoId, logData, callback);
  };

  // Call DB to update user's twitter information
  exports.updateTwitterInfo = function(userId, sessionUser, userData, logData, callback, rollback) {
    log.functionCall(SERVICE, 'updateTwitterInfo', logData.parentProcess, logData.username, {'userId':userId, 'sessionUser.username':(sessionUser)?sessionUser.username:'invalid',
      'userData.screenName':(userData)?userData.screenName:'invalid'});

    // Validate userId
    if(AugeoValidator.isMongooseObjectIdValid(userId, logData)) {

      TwitterUser.updateUser(userId, userData, sessionUser.username, logData, function () {

        // Don't update profile image if one already exists
        if (sessionUser.profileImg != 'image/avatar-medium.png') {
          userData.profileImageUrl = sessionUser.profileImg;
        }

        // Don't update profile icon if one already exists
        if (sessionUser.profileIcon != 'image/avatar-small.png') {
          userData.profileIcon = sessionUser.profileIcon;
        }

        User.setProfileImage(sessionUser.username, userData.profileImageUrl, userData.profileIcon, logData, function () {
          User.getUserWithUsername(sessionUser.username, logData, function (updatedUser) {
            callback(updatedUser);
          });
        });
      });
    } else {
      rollback();
    }
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  // Calculate Twitter skill experience based on tweets and mentions
  var calculateTwitterExperience = function(tweets, screenName, isMention, logData) {
    log.functionCall(SERVICE, 'calculateTwitterExperience (private)', logData.parentProcess, logData.username, {'tweets':(tweets)?tweets.length:'invalid',
      'screenName':screenName,'isMention':isMention});

    var mainSkillExperience = 0;
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, logData);
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

  // Calculate experience from tweet
  var getTwitterExperience = function(tweet, username, isRetweet, logData) {
    log.functionCall(SERVICE, 'getTwitterExperience (private)', logData.parentProcess, logData.username, {'tweet.experience':(tweet)?tweet.experience:'invalid',
      'username':username,'isRetweet':isRetweet});

    var tweetExperience = TwitterUtility.getExperience(tweet, username, isRetweet, logData);

    // Set subskills experience
    var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, logData);
    subSkillsExperience[tweet.classification] += tweetExperience;

    return {
      mainSkillExperience: tweetExperience,
      subSkillsExperience: subSkillsExperience
    };
  };

  // Update actionee's information based off of tweet and mention
  var updateActionee = function(actionee, action, tweet, mention, logData, callback) {
    log.functionCall(SERVICE, 'updateActionee', logData.parentProcess, logData.username, {'actionee.username':(actionee)?actionee.username:'invalid',
      'action.tweetId':(action)?action.tweetId:'invalid', 'tweet.tweetId':(tweet)?tweet.tweetId:'invalid','mention.mentioneeScreenName':(mention)?mention.mentioneeScreenName:'invalid'});

    // Get tweet experience
    var actioneeExperience = getTwitterExperience(tweet, action.actionerScreenName, action.isRetweet, logData);

    var tweetId;
    if(action.isRetweet) {

      // Increment retweet count
      Tweet.incrementRetweetCount(action.retweetId, logData, function() {});

      // Get tweetId to update tweet's experience
      tweetId = action.retweetId;
    } else { // Logic for a reply

      // Get tweetId to update tweets's experience
      tweetId = action.replyId;
    } // End reply to else

    // Update actionee's Tweet experience
    Tweet.updateExperience(tweetId, actioneeExperience, logData, function(){});

    User.updateSkillData(actionee._id, actioneeExperience, logData, function() {
      callback(tweet.classification);
    });
  };
