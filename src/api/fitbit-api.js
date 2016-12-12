
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
  /* Description: Handles requests to Augeo's fitbit-api                     */
  /***************************************************************************/

  // Required libraries
  var FitbitRouter = require('express').Router();

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var Logger = require('../module/logger');
  var AugeoValidator = require('../validator/augeo-validator');
  var FitbitInterfaceService = require('../interface-service/fitbit-interface-service');
  var FitbitQueueTask = require('../queue-task/fitbit/fitbit-event-task');
  var FitbitService = require('../service/fitbit-service');
  var QueueService = require('../service/queue-service');
  var UserService = require('../service/user-service');

  // Constants
  var API = 'fitbit-api';
  var CALLBACK = '/callback';
  var GET_AUTHENTICATION_DATA = '/getAuthenticationData';
  var GET_QUEUE_WAIT_TIMES = '/getQueueWaitTimes';
  var INVALID_SESSION = 'Invalid session';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* Service starts                                                          */
  /***************************************************************************/

  FitbitRouter.get(CALLBACK, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(errorCode, message) {
      log.functionError(API, CALLBACK, username, message);

      // Remove invalid entry from FITBIT_USER
      if(username && request.session.user._id) {
        var logData = AugeoUtility.formatLogData(API+CALLBACK, username);
        FitbitService.removeUser(request.session.user._id, logData, function(){}, function(){});
      }
      response.redirect(process.env.AUGEO_HOME + '/signup/error'); // Redirect to signup error page
    };

    if(username) {
      log.functionCall(API, CALLBACK, null, username);
      var logData = AugeoUtility.formatLogData(API+CALLBACK, username);

      var userId = request.session.user._id;
      var code = request.query.code;

      FitbitInterfaceService.getAuthData(code, logData, function(accessToken, refreshToken, fitbitId) {
        if(accessToken && refreshToken && fitbitId) {
          FitbitInterfaceService.getUserData(accessToken, logData, function(userData) {
            FitbitService.checkExistingFitbitId(fitbitId, logData, function(doesFitbitIdExist) {

              if(!doesFitbitIdExist) {

                userData.augeoUser = userId;
                userData.fitbitId = fitbitId;
                userData.refreshToken = refreshToken;

                FitbitService.addUser(username, userData, logData, function(addedUser) {

                  var period = '1y';
                  FitbitInterfaceService.getSteps(userData, period, logData, function(stepHistory) {

                    if(stepHistory instanceof Array) {
                      FitbitService.addDailySteps(stepHistory, logData, function () {

                        FitbitService.getLastDateTime(userData.fitbitId, logData, function (lastDateTime) {

                          if (process.env.TEST != 'true') {
                            var task = new FitbitQueueTask(addedUser, JSON.parse(JSON.stringify(userData)), lastDateTime, logData);
                            QueueService.fitbitEventQueue.addTask(task, logData);
                          }

                          // Set user's session data
                          request.session.user = addedUser.toJSON();
                          delete userData.accessToken;
                          delete userData.refreshToken;
                          request.session.user.fitbit = userData;

                          // Set profile image if none is set
                          if (request.session.user.profileImg == 'image/avatar-medium.png') {
                            UserService.setProfileImage('Fitbit', request.session.user, logData, function (updatedUser) {
                              request.session.user = updatedUser;
                              response.redirect(process.env.AUGEO_HOME + '/interfaceHistory');
                            });
                          } else {
                            response.redirect(process.env.AUGEO_HOME + '/interfaceHistory');
                          }
                        });
                      });
                    } else {
                      rollback(400, 'Failed to retrieve users steps');
                    }
                  });
                }, function(message) {
                  rollback(400, message);
                });
              } else {
                rollback(400, 'Fitbit user already exists');
              }
            });
          });
        } else {
          rollback(400, 'Invalid authorization response from Fitbit');
        }
      });
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  FitbitRouter.get(GET_AUTHENTICATION_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, GET_AUTHENTICATION_DATA, username, message);
      response.status(code).send('Fitbit authentication failed. Please try again.');
    };

    if(username) {
      log.functionCall(API, GET_AUTHENTICATION_DATA, null, request.session.user.username);

      var data = {
        clientId: process.env.FITBIT_CLIENT_ID,
        responseType: 'code',
        scope: 'activity nutrition profile',
        redirectUri: process.env.AUGEO_HOME + '/fitbit-api/callback',
        state: process.env.AUTH_STATE
      };

      response.status(200).send(data);
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  FitbitRouter.get(GET_QUEUE_WAIT_TIMES, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(message) {
      log.functionError(API, GET_QUEUE_WAIT_TIMES, username, message);
      response.sendStatus(401);
    };

    if(username) {
      log.functionCall(API, GET_QUEUE_WAIT_TIMES, null, username);

      var waitTimes = new Array();
      if(request.session.user.fitbit) {
        waitTimes.push(-1);
      } else {
        waitTimes.push(0);
      }

      response.status(200).json({waitTimes:waitTimes});
    } else { // If the user doesn't exist in session respond with "Unauthorized" HTTP code
      rollback(INVALID_SESSION);
    }
  });

  module.exports = FitbitRouter;

