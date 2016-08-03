
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

  // Required local modules
  var AugeoDB = require('../../src/model/database');
  var AugeoUtility = require('../../src/utility/augeo-utility');
  var Common = require('../test-case/common');
  var TwitterService = require('../../src/service/twitter-service');
  var UserService = require('../../src/service/user-service');

  // Global variables
  var Mention = AugeoDB.model('Mention');
  var Tweet = AugeoDB.model('Tweet');
  var User = AugeoDB.model('User');

  exports.addTestUsers = function(callback) {
    exports.addUser(Common.USER, function() {
      exports.addUser(Common.ACTIONEE, function() {
        callback();
      });
    });
  };

  exports.addUser = function(user, callback) {

    UserService.addUser(user, {}, function(retrievedUser) {

      var newUserSubSkills = AugeoUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, Common.logData), Common.logData);

      var twitterData = {
        twitterId: user.twitter.twitterId,
        name: user.fullName,
        screenName: user.twitter.screenName,
        profileImageUrl: user.twitter.profileImageUrl,
        accessToken: user.twitter.accessToken,
        secretAccessToken: user.twitter.secretAccessToken,
        skill: AugeoUtility.getMainSkill(0, Common.logData),
        subSkills: newUserSubSkills
      };

      // Update twitter information
      TwitterService.updateTwitterInfo(retrievedUser._id.toString(), user, twitterData, Common.logData, function() {
        callback();
      });
    }, function(){console.log('Twitter Helper -- Failed to add user')});
  };

  exports.cleanMentions = function(callback) {
    Mention.removeMentions('testScreenName', Common.logData, function() {
      Mention.removeMentions('twitterActionee', Common.logData, function() {
        callback();
      });
    });
  };

  exports.cleanAugeoDB = function(callback) {
    exports.cleanTweets(function() {
      exports.cleanMentions(function() {
        exports.cleanUsers(function(){
          callback()
        });
      });
    });
  };

  exports.cleanTweets = function(callback) {
    Tweet.removeTweets('testScreenName', Common.logData, function() {
      Tweet.removeTweets('twitterActionee', Common.logData, function() {
        Tweet.removeTweetsWithMentionee("testScreenName", Common.logData, function() {
          Tweet.removeTweetsWithMentionee("twitterActionee", Common.logData, function() {
            callback();
          });
        });
      });
    });
  };

  exports.cleanUsers = function(callback) {
    User.remove('tester', Common.logData, function(user1) {
      User.remove('actionee', Common.logData, function(user2) {
        callback();
      });
    });
  };
