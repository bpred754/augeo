
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
  /* Description: Handles logic related to interfacing with Fitbit           */
  /***************************************************************************/

  var fitbitInterfaceUrl = process.env.TEST === 'true' ? '../../test/test-interface/fitbit-test-interface' : '../interface/fitbit-interface';

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var DaySteps = require('../public/javascript/common/day-steps');
  var FitbitInterface = require(fitbitInterfaceUrl);
  var Logger = require('../module/logger');

  // Constants
  var SERVICE = 'fitbit-interface_service';

  // Global variables
  var log = new Logger();

  exports.getAuthData = function(code, logData, callback) {
    log.functionCall(SERVICE, 'getAuthData', logData.parentProcess, logData.username);

    FitbitInterface.getAuthData(code, logData, function(data) {
      if(data && typeof data == 'string') {
        var json = JSON.parse(data);
        if (json && typeof json == 'object') {
          callback(json.access_token, json.refresh_token, json.user_id);
        } else {
          callback();
        }
      } else {
        callback();
      }
    });
  };

  exports.getSteps = function(fitbitUser, period, logData, callback) {
    log.functionCall(SERVICE, 'getSteps', logData.parentProcess, logData.username, {'fitbitUser.name':(fitbitUser)?fitbitUser.name:'invalid',
      'period':period});

    FitbitInterface.getSteps(fitbitUser.accessToken, period, logData, function(history) {
      var dailySteps;
      if(history && typeof history == 'string') {
        dailySteps = extractDailySteps(history, fitbitUser, logData);
      }
      callback(dailySteps);
    });
  };

  exports.getUserData = function(accessToken, logData, callback) {
    log.functionCall(SERVICE, 'getUserData', logData.parentProcess, logData.username, {'accessToken': (accessToken)?'valid':'invalid'});

    FitbitInterface.getUserData(accessToken, logData, function(userData) {

      var user = {};
      if(userData && typeof userData == 'string') {
        var json = JSON.parse(userData);
        if(json.user) {
          user = {
            accessToken:accessToken,
            name: json.user.fullName,
            profileImageUrl: json.user.avatar150
          };
        }
      }
      callback(user);
    });
  };

  exports.refreshAccessToken = function(refreshToken, logData, callback) {
    log.functionCall(SERVICE, 'refreshAccessToken', logData.parentProcess, logData.username, {'refreshToken':(refreshToken)?'valid':'invalid'});

    FitbitInterface.refreshAccessToken(refreshToken, logData, function(data) {
      if(data && typeof data == 'string') {
        callback(JSON.parse(data));
      } else{
        callback();
      }
    });
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var extractDailySteps = function(history, fitbitUser, logData) {
    var json = JSON.parse(history);

    var dailySteps = new Array();

    if(json) {

      if(!json['errors']) {
        var dailyStepsJson = json['activities-tracker-steps'];

        for (var i = 0; i < dailyStepsJson.length; i++) {
          var dayStepsJson = dailyStepsJson[i];
          var dateParts = AugeoUtility.getDateParts(dayStepsJson.dateTime, logData);

          var daySteps = {
            classification: 'Fitness',
            classificationGlyphicon: 'glyphicon-heart',
            dateTime: dayStepsJson.dateTime,
            kind: 'FITBIT_DAY_STEPS',
            steps: dayStepsJson.value,
            timestamp: new Date(dateParts.year, dateParts.month, dateParts.day).getTime(),
            user: fitbitUser.augeoUser
          };

          if (daySteps.steps > 0) {
            daySteps.experience = Math.floor(daySteps.steps / 100);
            dailySteps.push(new DaySteps(daySteps, fitbitUser));
          }
        }
      } else {
        dailySteps = json['errors'][0].errorType;
      }
    }

    return dailySteps;
  };