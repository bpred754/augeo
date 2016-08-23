
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
  /* Description: Handles logic related to interfacing with Github           */
  /***************************************************************************/

  // Required local modules
  var githubInterfaceUrl = process.env.TEST === 'true' ? '../../test/test-interface/github-test-interface' : '../interface/github-interface';
  var GithubInterface = require(githubInterfaceUrl);
  var Logger = require('../module/logger');

  // Constants
  var SERVICE = 'github-interface_service';

  // Global variables
  var log = new Logger();

  exports.getAccessToken = function(code, logData, callback) {
    log.functionCall(SERVICE, 'getAccessToken', logData.parentProcess, logData.username, {'code':(code)?'valid':'invalid'});

    GithubInterface.getAccessToken(code, logData, function(data) {

      var accessToken = '';
      if(data) {
        accessToken = JSON.parse(data).access_token;
      }

      callback(accessToken);
    });
  };

  exports.getUserData = function(accessToken, logData, callback) {
    log.functionCall(SERVICE, 'getUserData', logData.parentProcess, logData.username, {'accessToken': (accessToken)?'valid':'invalid'});

    GithubInterface.getUserData(accessToken, logData, function(userData) {

      var user = {};
      if(userData) {
        var json = JSON.parse(userData);
        user = {
          accessToken:accessToken,
          githubId: json.id,
          name: json.name,
          profileImageUrl: json.avatar_url,
          screenName: json.login
        };
      }
      callback(user);
    });
  };
