
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
  /* Description: Handles all interfaces with the Github API                 */
  /***************************************************************************/

  // Required libraries
  var Https = require('https');

  // Required local modules
  var Logger = require('../module/logger');

  // Constants
  var INTERFACE = 'github-interface';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* Github Calls                                                            */
  /***************************************************************************/

  exports.getAccessToken = function(code, logData, callback) {
    log.functionCall(INTERFACE, 'getAccessToken', logData.parentProcess, logData.username);

    var options = {
      hostname: 'github.com',
      method: 'POST',
      path: '/login/oauth/access_token?client_id=' + process.env.GITHUB_CLIENT_ID + '&client_secret=' + process.env.GITHUB_CLIENT_SECRET + '&code=' + code,
      headers: {
        'accept': 'application/json'
      }
    };

    Https.request(options, function(response) {
      requestCallback(response, logData, callback)
    }).end();
  };

  exports.getPushEvents = function(accessToken, path, eTag, logData, callback) {
    log.functionCall(INTERFACE, 'getPushEvents', logData.parentProcess, logData.username, {'accessToken':(accessToken)?'valid':'invalid','path':path,'eTag':eTag});

    var options = {
      hostname: 'api.github.com',
      method: 'GET',
      path: path,
      headers: {
        'Authorization': 'token ' + accessToken,
        'If-None-Match': eTag,
        'User-Agent': process.env.GITHUB_SCREEN_NAME
      }
    };

    Https.request(options, function(response) {
      requestCallback(response, logData, callback)
    }).end();
  };

  exports.getUserData = function(accessToken, logData, callback) {
    log.functionCall(INTERFACE, 'getUserData', logData.parentProcess, logData.username, {'accessToken':(accessToken)?'valid':'invalid'})

    var options = {
      hostname: 'api.github.com',
      method: 'GET',
      path: '/user',
      headers: {
        'User-Agent': process.env.GITHUB_SCREEN_NAME,
        'Authorization': 'token ' + accessToken
      }
    };

    Https.request(options, function(response) {
      requestCallback(response, logData, callback)
    }).end();
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var requestCallback = function(response, logData, callback) {
    var data = '';
    response.on('data', function (chunk) {
      data += chunk;
    });

    response.on('end', function () {
      log.functionCall(INTERFACE, 'requestCallback (private)', logData.parentProcess, logData.username, {}, 'Retrieved all data from Github request');

      callback(data, response.headers);
    });

    response.on('error', function(error) {
      log.functionError(INTERFACE, 'requestCallback (private)', logData.parentProcess, logData.username, 'Error with Github request: ' + error);
    });
  };