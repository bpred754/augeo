
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
  /* Description: Handles Github  business logic                             */
  /***************************************************************************/

  // Required local modules
  var AugeoDB = require('../model/database');
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Classifier = require('../classifier/app-classifier');
  var Logger = require('../module/logger');

  // Constants
  var SERVICE = 'github-service';

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var Commit = AugeoDB.model('GITHUB_COMMIT');
  var GithubUser = AugeoDB.model('GITHUB_USER');
  var User = AugeoDB.model('AUGEO_USER');
  var classifier = new Classifier();
  var log = new Logger();

  exports.addCommits = function(screenName, commits, logData, callback) {
    log.functionCall(SERVICE, 'addCommits', logData.parentProcess, logData.username, {'screenName': screenName, 'commits.length': (commits)?commits.length:'invalid'});

    if(commits.length > 0) {
      Commit.addCommits(screenName, commits, logData, function(insertedCommits) {

        // Update commits with database IDs
        for(var i = 0; i < insertedCommits.length; i++) {
          commits[i].data = insertedCommits[i]._id;
        }

        Activity.addActivities(commits, logData, function(insertedActivities) {
          var skillsExperience = AugeoUtility.calculateSkillsExperience(insertedActivities, logData);
          User.updateSkillData(commits[0].user, skillsExperience, logData, function () {
            callback();
          });
        });
      });
    } else {
      callback();
    }
  };

  exports.addUser = function(username, user, logData, callback, rollback) {
    log.functionCall(SERVICE, 'addUser', logData.parentProcess, logData.username, {'user.augeoUser': (user)?user.augeoUser:'invalid'});

    if(AugeoValidator.isMongooseObjectIdValid(user.augeoUser, logData) && user.githubId && user.screenName && user.accessToken) {
      GithubUser.add(username, user, logData, callback);
    } else {
      rollback('Invalid Github user');
    }
  };

  exports.checkExistingScreenName = function(screenName, logData, callback) {
    log.functionCall(SERVICE, 'checkExistingScreenName', logData.parentProcess, logData.username, {'screenName': screenName});

    GithubUser.getUserWithScreenName(screenName, logData, function(user) {
      if(user) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };

  exports.getLatestCommitEventId = function(screenName, logData, callback) {
    log.functionCall(SERVICE, 'getLatestCommitEventId', logData.parentProcess, logData.username, {'screenName':screenName});

    Commit.getLatestCommit(screenName, logData, function(commit) {
      var eventId = null;
      if(commit) {
        eventId = commit.eventId;
      }
      callback(eventId);
    });
  };

  exports.loopThroughUsersQueueData = function(logData, callback, finalCallback) {
    log.functionCall(SERVICE, 'loopThroughUsersQueueData', logData.parentProcess, logData.username);

    GithubUser.getAllUsers(logData, function(users) {
      if(users.length > 0) {
        // Asynchronous method calls in loop - Using Recursion
        (function myClojure(i) {
          var user = users[i];
          exports.getLatestCommitEventId(user.screenName, logData, function (eventId) {
            callback({user:user, eventId: eventId});
            i++;
            if (i < users.length) {
              myClojure(i);
            } else {
              finalCallback();
            }
          });
        })(0); // Pass i as 0 and myArray to myClojure
      }
    });
  };

  exports.removeUser = function(augeoId, logData, callback, rollback) {
    log.functionCall(SERVICE, 'removeUser', logData.parentProcess, logData.username, {'augeoId': augeoId});

    if(AugeoValidator.isMongooseObjectIdValid(augeoId, logData)) {
      GithubUser.remove(augeoId, logData,  callback);
    } else {
      rollback('Invalid AugeoUser ID');
    }
  };