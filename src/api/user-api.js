
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
  /* Description: Handles requests to Augeo's user-api                       */
  /***************************************************************************/

  // Required libraries
  var UserRouter = require('express').Router();

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var EmailProvider = require('../module/email-provider');
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');

  // Constants
  var ADD = '/add';
  var API = 'user-api';
  var GET_ACTIVITY_DISPLAY_DATA = '/getActivityDisplayData';
  var GET_COMPETITORS = '/getCompetitors';
  var GET_CURRENT_USER = '/getCurrentUser';
  var GET_LEADERBOARD_DISPLAY_DATA = '/getLeaderboardDisplayData';
  var INVALID_SESSION = 'Invalid session';
  var LOGIN = '/login';
  var LOGOUT = '/logout';
  var REMOVE = '/remove';
  var SAVE_PROFILE_DATA = '/saveProfileData';
  var SET_PROFILE_IMAGE = '/setProfileImage';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* GET Requests                                                            */
  /***************************************************************************/

  UserRouter.get(GET_ACTIVITY_DISPLAY_DATA, function(request, response) {

    if(AugeoValidator.isSessionValid(request)) {
      log.functionCall(API, GET_ACTIVITY_DISPLAY_DATA, null, request.session.user.username);

      var jsonResponse = {
        skills: AugeoUtility.SUB_SKILLS
      };
      response.status(200).send(jsonResponse);
    } else {
      log.functionError(API, GET_ACTIVITY_DISPLAY_DATA, null, INVALID_SESSION);
      response.sendStatus(401);
    }

  });

  UserRouter.get(GET_COMPETITORS, function(request, response) {
    var sessionUsername = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;
    var logData = AugeoUtility.formatLogData(API+GET_COMPETITORS, sessionUsername);

    var rollback = function(code, message) {
      log.functionError(API, GET_COMPETITORS, sessionUsername, message);
      response.sendStatus(code);
    };

    if(sessionUsername) {
      var username = request.query.username;
      var startRank = request.query.startRank;
      var endRank = request.query.endRank;
      var skill = request.query.skill;

      log.functionCall(API, GET_COMPETITORS, null, sessionUsername, {'username':username,'startRank':startRank,'endRank':endRank,'skill':skill});
      if (username) {
        UserService.getCompetitors(username, skill, logData, function (users) {
          response.status(200).json(users);
        }, rollback);
      } else {
        UserService.getCompetitorsWithRank(startRank, endRank, skill, logData, function (users) {
          response.status(200).json(users);
        }, rollback)
      }
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  UserRouter.get(GET_CURRENT_USER, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    if(username) {
      var logData = AugeoUtility.formatLogData(API+GET_CURRENT_USER, username);
      log.functionCall(API, GET_CURRENT_USER, null, username);

      UserService.getSessionUser(username, logData, function(user) {
        response.status(200).send(user);
      }, function() {
        log.functionError(API, GET_CURRENT_USER, username, 'Failed to find session user');
        response.sendStatus(401);
      });
    } else {
      response.sendStatus(200);
    }
  });

  UserRouter.get(GET_LEADERBOARD_DISPLAY_DATA, function(request, response) {

    if(AugeoValidator.isSessionValid(request)) {
      var username = request.session.user.username;
      log.functionCall(API, GET_LEADERBOARD_DISPLAY_DATA, null, username);
      var logData = AugeoUtility.formatLogData(API+GET_LEADERBOARD_DISPLAY_DATA, username);

      UserService.getNumberUsers(logData, function(numUsers) {

        var jsonResponse = {
          skills: AugeoUtility.SUB_SKILLS,
          numberUsers: numUsers
        }
        response.status(200).json(jsonResponse);
      });
    } else {
      log.functionError(API, GET_LEADERBOARD_DISPLAY_DATA, null, INVALID_SESSION);
      response.sendStatus(401);
    }

  });

  /***************************************************************************/
  /* POST Requests                                                           */
  /***************************************************************************/

  UserRouter.post(ADD, function(request, response) {

    // Make sure user is not logged in
    if(!AugeoValidator.isSessionValid(request)) {

      var user = {
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        username: request.body.username,
        password: request.body.password,
        profileImg: 'image/avatar-medium.png',
        profileIcon: 'image/avatar-small.png'
      };

      log.functionCall(API, ADD, null, user.username, {'firstName':user.firstName,'lastName':user.lastName,'email':user.email,'username':user.username});
      var logData = AugeoUtility.formatLogData(API+ADD, user.username);

      // Check if email exists
      UserService.doesEmailExist(user.email, logData, function (emailExists) {

        if (emailExists) {
          log.functionError(API, ADD, user.email, 'Email exists');
          response.status(400).send('This email already exists. Please try another.');
        } else {

          UserService.doesUsernameExist(user.username, logData, function (usernameExists) {

            if (usernameExists) {
              log.functionError(API, ADD, user.username, 'Username exists');
              response.status(400).send('This username already exists. Please try another.');
            } else {

              var addUser = function (_user) {
                UserService.addUser(_user, logData, function () {
                  response.sendStatus(200);
                }, function () {
                  log.functionError(API, ADD, user.username, 'Invalid input');
                  response.status(400).send('Invalid input. Please try again.');
                });
              };

              if (process.env.ENV == 'prod') {

                // Add user to SendGrid contacts
                EmailProvider.addRecipient(user, logData, function (recipientId) {
                  EmailProvider.sendWelcomeEmail(user, logData);

                  user.sendGridId = recipientId ? recipientId : '';
                  addUser(user);
                });
              } else {
                addUser(user);
              }
            }
          });
        }
        ;
      });
    } else {
      log.functionError(API, ADD, null, 'Session exists');
      response.status(400).send('Cannot signup when logged in');
    }
  });

  UserRouter.post(LOGIN, function(request, response) {

    var rollback = function(message) {
      log.functionError(API, LOGIN, request.body.email, message);
      response.status(400).send(message);
    };

    if(!AugeoValidator.isSessionValid(request)) {
      log.functionCall(API, LOGIN, null, request.body.email);
      var logData = AugeoUtility.formatLogData(API+LOGIN);

      UserService.login(request.body.email, request.body.password, logData, function(pUser) {

        // Set session user
        if(pUser != null) {
          request.session.user = pUser;
          response.sendStatus(200);
        } else {
          rollback(UserService.INCORRECT_LOGIN);
        }

      }, rollback);
    } else {
      rollback('Already logged in');
    }

  });

  UserRouter.post(LOGOUT, function(request, response) {

    // Destroy the session
    if(AugeoValidator.isSessionValid(request)) {
      log.functionCall(API, LOGOUT, null, request.session.user.username);
      request.session.destroy();
      response.status(200).send('You have successfully logged out.');
    } else {
      log.functionCall(API, LOGOUT);
      response.sendStatus(200);
    }

  });

  UserRouter.post(REMOVE, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, REMOVE, username, message);
      response.status(code).send(message);
    };

    if(username) {
      log.functionCall(API, REMOVE, null, username);
      var logData = AugeoUtility.formatLogData(API+REMOVE, username);

      UserService.removeUserWithPassword(username, request.body.password, logData, function(error, user) {
        if(error) {
          rollback(401, 'Incorrect password');
        } else if(user) {

          if(process.env.ENV == 'prod') {
            // Remove user from SendGrid contacts
            EmailProvider.removeRecipient(user.sendGridId, logData);
          }

          // Destroy the session
          request.session.destroy();
          response.sendStatus(200);
        } else {
          rollback(400, UserService.REMOVE_USER_FAILURE);
        }
      }, rollback);
    } else {
      rollback(400, UserService.REMOVE_USER_FAILURE);
    }
  });

  UserRouter.post(SAVE_PROFILE_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, SAVE_PROFILE_DATA, username, message);
      response.status(code).send(message);
    };

    var profileData = {
      username: request.body.username,
      profession: request.body.profession,
      location : request.body.location,
      website: request.body.website,
      description: request.body.description
    };

    if(username && username == profileData.username) {
      var logData = AugeoUtility.formatLogData(API+SAVE_PROFILE_DATA, username);
      log.functionCall(API, SAVE_PROFILE_DATA, null, username, {'username':profileData.username,'profession':profileData.profession,
        'location':profileData.location,'website':profileData.website,'description':profileData.description});

      UserService.saveProfileData(profileData, logData, function(user) {

        if(user) {
          request.session.user = user; // Update session user object
          response.status(200).send(user);
        } else {
          rollback(400, 'Failed to save profile data');
        }

      });
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  UserRouter.post(SET_PROFILE_IMAGE, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, SET_PROFILE_IMAGE, username, message);
      response.status(code).send(message);
    };

    var interface = request.body.interface;

    if(username) {
      var logData = AugeoUtility.formatLogData(API+SET_PROFILE_IMAGE, username);
      log.functionCall(API, SET_PROFILE_IMAGE, null, username, {'interface': interface});
      UserService.setProfileImage(interface, request.session.user, logData, function(user) {

        if(user) {
          request.session.user = user; // Update session user object
          response.status(200).send(user);
        } else {
          rollback(400, 'Failed to set profile image');
        }
      });
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  module.exports = UserRouter;
