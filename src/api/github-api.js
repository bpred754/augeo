
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
  /* Description: Handles requests to Augeo's github-api                     */
  /***************************************************************************/

  // Required libraries
  var GithubRouter = require('express').Router();

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var Logger = require('../module/logger');
  var AugeoValidator = require('../validator/augeo-validator');
  var GithubEventQueue = require('../queue/github-event-queue');
  var GithubInterfaceService = require('../interface-service/github-interface-service');
  var GithubQueueTask = require('../queue-task/github-queue-task');
  var GithubService = require('../service/github-service');
  var UserService = require('../service/user-service');

  // Constants
  var API = 'github-api';
  var CALLBACK = '/callback';
  var GET_AUTHENTICATION_DATA = '/getAuthenticationData';
  var INVALID_SESSION = 'Invalid session';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* Service starts                                                          */
  /***************************************************************************/

  GithubRouter.get(CALLBACK, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(errorCode, message) {
      log.functionError(API, CALLBACK, username, message);

      // Remove invalid entry from GITHUB_USER
      if(username && request.session.user._id) {
        var logData = AugeoUtility.formatLogData(API+CALLBACK, username);
        GithubService.removeUser(request.session.user._id, logData, function(){}, function(){});
      }
      response.redirect(errorCode, process.env.AUGEO_HOME + '/signup/error'); // Redirect to signup error page
    };

    if(username) {
      log.functionCall(API, CALLBACK, null, username);
      var logData = AugeoUtility.formatLogData(API+CALLBACK, username);

      var userId = request.session.user._id;
      var code = request.query.code;
      var state = request.query.state;

      if(code && state == process.env.GITHUB_STATE) {

        GithubInterfaceService.getAccessToken(code, logData, function(accessToken) {

        if(accessToken) {

          // Retrieve Github user information
          GithubInterfaceService.getUserData(accessToken, logData, function (userData) {

            if(userData.githubId) {
              userData.augeoUser = userId;

              // Verify access token does not exist in database - no duplicate Github accounts
              GithubService.checkExistingScreenName(userData.screenName, logData, function (doesScreenNameExist) {

                if (!doesScreenNameExist) {

                  GithubService.addUser(username, userData, logData, function (addedUser) {

                    GithubService.getLatestCommitEventId(userData.screenName, logData, function(eventId) {
                      var eventQueue = new GithubEventQueue();
                      var task = new GithubQueueTask(userId, userData.screenName, userData.accessToken, eventId, logData);
                      eventQueue.addTask(task, logData);

                      // Set user's session data
                      request.session.user = addedUser.toJSON();
                      delete userData.accessToken;
                      request.session.user.github = userData;

                      // Set profile image if none is set
                      if (request.session.user.profileImg == 'image/avatar-medium.png') {
                        UserService.setProfileImage('Github', request.session.user, logData, function (updatedUser) {
                          request.session.user = updatedUser;
                          response.redirect(process.env.AUGEO_HOME + '/twitterHistory');
                        });
                      } else {
                        response.redirect(process.env.AUGEO_HOME + '/twitterHistory');
                      }
                    });
                  }, function (message) {
                    rollback(400, message);
                  });
                } else {
                  rollback(400, 'Github user already authenticated');
                }
              });
            } else {
              rollback(400, 'Failed to retrieve Github user data')
            }
          });
        } else {
          rollback(400, 'Failed to retrieve access token from Github');
        }
        });
      } else {
        rollback(400, 'States do not match');
      }
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  GithubRouter.get(GET_AUTHENTICATION_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, GET_AUTHENTICATION_DATA, username, message);
      response.status(code).send('Github authentication failed. Please try again.');
    };

    if(username) {
      log.functionCall(API, GET_AUTHENTICATION_DATA, null, request.session.user.username);

      var data = {
        clientId: process.env.GITHUB_CLIENT_ID,
        redirectUrl: process.env.AUGEO_HOME + '/github-api/callback',
        scope: 'public_repo',
        state: process.env.GITHUB_STATE
      };

      response.status(200).send(data);
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  module.exports = GithubRouter;

