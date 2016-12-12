
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
  /* Description: Handles all interfaces with the Fitbit API                 */
  /***************************************************************************/

  // Required local modules
  var Logger = require('../module/logger');
  var RequestUtility = require('../utility/request-utility');

  // Constants
  var INTERFACE = 'fitbit-interface';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* Fitbit Calls                                                            */
  /***************************************************************************/

  exports.getAuthData = function(code, logData, callback) {
    log.functionCall(INTERFACE, 'getAuthData', logData.parentProcess, logData.username);

    var options = {
      hostname: 'api.fitbit.com',
      method: 'POST',
      path: '/oauth2/token?code=' + code + '&grant_type=authorization_code&client_id=' + process.env.FITBIT_CLIENT_ID +
        '&redirect_uri=' + process.env.AUGEO_HOME + '/fitbit-api/callback&state=' + process.env.AUTH_STATE,
      headers: {
        'Authorization': 'Basic ' + new Buffer(process.env.FITBIT_CLIENT_ID + ':' + process.env.FITBIT_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var dnsCheckCount = 0;
    RequestUtility.request(dnsCheckCount, options, callback, function(error) {
      log.functionError(INTERFACE, 'getAuthData', logData.parentProcess, logData.username, 'Failed to retrieve Fitbit users auth data. Error: ' + error);
      callback(error);
    });
  };

  exports.getSteps = function(accessToken, period, logData, callback) {
    log.functionCall(INTERFACE, 'getSteps', logData.parentProcess, logData.username, {'accessToken':(accessToken)?'valid':'invalid',
      'period': period});

    var options = {
      hostname: 'api.fitbit.com',
      method: 'GET',
      path: '/1/user/-/activities/tracker/steps/date/today/' + period + '.json',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept-Language': 'en'
      }
    };

    var dnsCheckCount = 0;
    RequestUtility.request(dnsCheckCount, options, callback, function(error) {
      log.functionError(INTERFACE, 'getSteps', logData.parentProcess, logData.username, 'Failed to retrieve Fitbit users steps. Error: ' + error);
      callback(error);
    });
  };

  exports.getUserData = function(accessToken, logData, callback) {
    log.functionCall(INTERFACE, 'getUserData', logData.parentProcess, logData.username, {'accessToken':(accessToken)?'valid':'invalid'});

    var options = {
      hostname: 'api.fitbit.com',
      method: 'GET',
      path: '/1/user/-/profile.json',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };

    var dnsCheckCount = 0;
    RequestUtility.request(dnsCheckCount, options, callback, function(error) {
      log.functionError(INTERFACE, 'getUserData', logData.parentProcess, logData.username, 'Error with Fitbit request: ' + error);
      callback(error);
    });
  };

  exports.refreshAccessToken = function(refreshToken, logData, callback) {
    log.functionCall(INTERFACE, 'refreshAccessToken', logData.parentProcess, logData.username, {'refreshToken': (refreshToken)?'valid':'invalid'});

    var options = {
      hostname: 'api.fitbit.com',
      method: 'POST',
      path: '/oauth2/token?grant_type=refresh_token&refresh_token=' + refreshToken,
      headers: {
        'Authorization': 'Basic ' + new Buffer(process.env.FITBIT_CLIENT_ID + ':' + process.env.FITBIT_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var dnsCheckCount = 0;
    RequestUtility.request(dnsCheckCount, options, callback, function(error) {
      log.functionError(INTERFACE, 'refreshAccessToken', logData.parentProcess, logData.username, 'Error with Fitbit refresh access token request request: ' + error);
      callback(error);
    });
  };