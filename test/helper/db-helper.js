
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
  /* Description: Helper functions that abstract out database logic for      */
  /*              testing                                                    */
  /***************************************************************************/

  // Schemas
  require('../../src/model/schema/augeo/user');
  require('../../src/model/schema/augeo/activity');
  require('../../src/model/schema/augeo/flag');
  require('../../src/model/schema/augeo/staged-flag');
  require('../../src/model/schema/fitbit/day-steps');
  require('../../src/model/schema/fitbit/user');
  require('../../src/model/schema/github/commit');
  require('../../src/model/schema/github/user');
  require('../../src/model/schema/twitter/tweet');
  require('../../src/model/schema/twitter/user');

  // Required local modules
  var AugeoDB = require('../../src/model/database');
  var AugeoUtility = require('../../src/utility/augeo-utility');
  var Common = require('../data/common');
  var FitbitData = require('../data/fitbit-data');
  var GithubData = require('../data/github-data');
  var TwitterData = require('../data/twitter-data');
  var TwitterService = require('../../src/service/twitter-service');
  var UserService = require('../../src/service/user-service');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var AugeoUser = AugeoDB.model('AUGEO_USER');
  var Commit = AugeoDB.model('GITHUB_COMMIT');
  var DaySteps = AugeoDB.model('FITBIT_DAY_STEPS');
  var FitbitUser = AugeoDB.model('FITBIT_USER');
  var Flag = AugeoDB.model('AUGEO_FLAG');
  var GithubUser = AugeoDB.model('GITHUB_USER');
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');
  var Tweet = AugeoDB.model('TWITTER_TWEET');
  var TwitterUser = AugeoDB.model('TWITTER_USER');

  exports.addFitbitUser = function(user, callback) {

    var fitbitUser = {
      augeoUser: user._id,
      fitbitId: FitbitData.USER_FITBIT.fitbitId,
      accessToken: FitbitData.USER_FITBIT.accessToken,
      screenName: FitbitData.USER_FITBIT.screenName,
      profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl
    };

    FitbitUser.add(Common.USER.username, fitbitUser, Common.logData, function() {
      callback();
    });
  };

  exports.addGithubUser = function(user, callback) {

    var githubUser = {
      augeoUser: user._id,
      githubId: GithubData.USER_GITHUB.githubId,
      accessToken: GithubData.USER_GITHUB.accessToken,
      screenName: GithubData.USER_GITHUB.screenName,
      profileImageUrl: GithubData.USER_GITHUB.profileImageUrl
    };

    GithubUser.add(Common.USER.username, githubUser, Common.logData, function() {
     callback();
    })
  };

  exports.addTestUsers = function(callback) {
    UserService.addUser(Common.USER, {}, function(retrievedUser0) {
      exports.addFitbitUser(retrievedUser0, function() {
        exports.addGithubUser(retrievedUser0, function() {
          exports.addTwitterUser(retrievedUser0._id, Common.USER, TwitterData.USER_TWITTER, function() {
            UserService.addUser(Common.ACTIONEE, {}, function(retrievedUser1) {
              exports.addTwitterUser(retrievedUser1._id, Common.ACTIONEE, TwitterData.ACTIONEE_TWITTER, function() {
                callback();
              });
            }, function(){console.log('db-helper -- Failed to add user')});
          });
        });
      });
    }, function(){console.log('db-helper -- Failed to add user')});
  };

  exports.addTwitterUser = function(userId, user, twitter, callback) {

    TwitterUser.add(userId, twitter.secretToken, Common.logData, function() {

      var newUserSubSkills = AugeoUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, Common.logData), Common.logData);

      var twitterData = {
        twitterId: twitter.twitterId,
        name: user.fullName,
        screenName: twitter.screenName,
        profileImageUrl: twitter.profileImageUrl,
        accessToken: twitter.accessToken,
        secretAccessToken: twitter.secretAccessToken,
        skill: AugeoUtility.getMainSkill(0, Common.logData),
        subSkills: newUserSubSkills
      };

      // Update twitter information
      TwitterService.updateTwitterInfo(userId, user, twitterData, Common.logData, function(updatedUser) {
        callback();
      });
    });
  };

  exports.cleanActivities = function(callback) {
    AugeoUser.getUserWithUsername(Common.USER.username, Common.logData, function(user0) {
      AugeoUser.getUserWithUsername(Common.ACTIONEE.username, Common.logData, function(user1) {
        Activity.removeActivities((user0)?user0._id:'', Common.logData, function() {
          Activity.removeActivities((user1)?user1._id:'', Common.logData, function() {
            callback();
          });
        })
      });
    });
  };

  exports.cleanAugeoDB = function(callback) {
    exports.cleanDaySteps(function() {
      exports.cleanFlags(function() {
        exports.cleanStagedFlags(function() {
          exports.cleanTweets(function() {
            exports.cleanCommits(function() {
              exports.cleanActivities(function() {
                exports.cleanUsers(function() {
                  callback();
                });
              });
            });
          });
        });
      })
    });
  };

  exports.cleanCommits = function(callback) {
    Commit.removeCommits(GithubData.USER_GITHUB.screenName, Common.logData, function() {
      callback();
    });
  };

  exports.cleanDaySteps = function(callback) {
    DaySteps.removeDailySteps(FitbitData.USER_FITBIT.fitbitId,  Common.logData, function() {
      callback();
    });
  };

  exports.cleanFlags = function(callback) {
    var todayDate = AugeoUtility.calculateReclassifyDate(Date.now(), 0, Common.logData);
    Flag.removeFlags(todayDate, Common.logData, function() {
      callback();
    });
  };

  exports.cleanStagedFlags = function(callback) {
    var todayDate = AugeoUtility.calculateReclassifyDate(Date.now(), 0, Common.logData);
    StagedFlag.removeStagedFlags(todayDate, Common.logData, function() {
      callback();
    });
  };

  exports.cleanTweets = function(callback) {
    Tweet.removeTweets(TwitterData.USER_TWITTER.screenName, Common.logData, function() {
      Tweet.removeTweets(TwitterData.ACTIONEE_TWITTER.screenName, Common.logData, function() {
        Tweet.removeTweetsWithMentionee(TwitterData.USER_TWITTER.screenName, Common.logData, function() {
          Tweet.removeTweetsWithMentionee(TwitterData.ACTIONEE_TWITTER.screenName, Common.logData, function() {
            callback();
          });
        });
      });
    });
  };

  exports.cleanUsers = function(callback) {
    AugeoUser.remove(Common.USER.lastName, Common.logData, function(user1) {
      AugeoUser.remove(Common.ACTIONEE.lastName, Common.logData, function(user2) {
        FitbitUser.remove((user1)?user1._id:'', Common.logData, function(removedUser1) {
          FitbitUser.remove((user2)?user2._id:'', Common.logData, function(removedUser2) {
            GithubUser.remove((user1)?user1._id:'', Common.logData, function(removedUser3) {
              GithubUser.remove((user2)?user2._id:'', Common.logData, function(removedUser4) {
                TwitterUser.remove((user1)?user1._id:'', Common.logData, function(removedUser5) {
                  TwitterUser.remove((user2)?user2._id:'', Common.logData, function(removedUser6) {
                    TwitterUser.removeInvalid(Common.logData, function() {
                      callback();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  };
