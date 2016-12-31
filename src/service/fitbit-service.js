
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
  /* Description: Handles Fitbit business logic                              */
  /***************************************************************************/

  // Required local modules
  var AugeoDB = require('../model/database');
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Classifier = require('../classifier/app-classifier');
  var Logger = require('../module/logger');

  // Constants
  var SERVICE = 'fitbit-service';

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var FitbitDaySteps = AugeoDB.model('FITBIT_DAY_STEPS');
  var FitbitUser = AugeoDB.model('FITBIT_USER');
  var User = AugeoDB.model('AUGEO_USER');
  var classifier = new Classifier();
  var log = new Logger();

  exports.addDailySteps = function(dailySteps, logData, callback) {

    if(dailySteps.length > 0) {
      FitbitDaySteps.addDailySteps(dailySteps, logData, function(insertedDailySteps) {

        // Update day-steps with database IDs
        for(var i = 0; i < insertedDailySteps.length; i++) {
          dailySteps[i].data = insertedDailySteps[i]._id;
        }

        Activity.addActivities(dailySteps, logData, function(insertedActivities) {
          var skillsExperience = AugeoUtility.calculateSkillsExperience(insertedActivities, logData);
          User.updateSkillData(dailySteps[0].user, skillsExperience, logData, function () {
            callback(insertedActivities);
          });
        });
      });
    } else {
      callback();
    }
  };

  exports.addUser = function(username, user, logData, callback, rollback) {
    log.functionCall(SERVICE, 'addUser', logData.parentProcess, logData.username, {'user.augeoUser': (user)?user.augeoUser:'invalid'});

    if(AugeoValidator.isMongooseObjectIdValid(user.augeoUser, logData) && user.fitbitId && user.accessToken) {
      FitbitUser.add(username, user, logData, callback);
    } else {
      rollback('Invalid Fitbit user');
    }
  };

  exports.checkExistingFitbitId = function(fitbitId, logData, callback) {
    log.functionCall(SERVICE, 'checkExistingFitbitId', logData.parentProcess, logData.username, {'fitbitId': fitbitId});

    FitbitUser.getUserWithFitbitId(fitbitId, logData, function(user) {
      if(user) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };

  exports.getLastDateTime = function(fitbitId, logData, callback) {
    log.functionCall(SERVICE, 'getLastDateTime', logData.parentProcess, logData.username, {'fitbitId': fitbitId});

    FitbitDaySteps.getLatestDaySteps(fitbitId, logData, function(latestDaySteps) {

      var lastDayTime;
      if(latestDaySteps) {
        lastDayTime = latestDaySteps.dateTime;
      }

      callback(lastDayTime);
    });
  };

  exports.loopThroughUsersQueueData = function(logData, callback, finalCallback) {
    log.functionCall(SERVICE, 'loopThroughUsersQueueData', logData.parentProcess, logData.username);

    FitbitUser.getAllUsers(logData, function(users) {
      if(users.length > 0) {
        // Asynchronous method calls in loop - Using Recursion
        (function myClojure(i) {
          var user = users[i];
          exports.getLastDateTime(user.fitbitId, logData, function (lastDateTime) {
            callback({user:user, lastDateTime: lastDateTime});
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
      FitbitUser.remove(augeoId, logData,  callback);
    } else {
      rollback(400, 'Invalid AugeoUser ID');
    }
  };