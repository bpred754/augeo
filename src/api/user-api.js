
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
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');
  var EmailProvider = require('../module/email-provider');

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* GET Requests                                                            */
  /***************************************************************************/

  UserRouter.get('/getCurrentUser', function(request, response) {
    log.info('Getting current user from session: ' + request.session.user);

    if(request.session.user) {
      response.status(200).send(request.session.user);
    } else {
      response.sendStatus(200);
    }
  });

  /***************************************************************************/
  /* POST Requests                                                           */
  /***************************************************************************/

  UserRouter.post('/add', function(request, response) {

    var user = {
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      username: request.body.username,
      password: request.body.password,
      profileImg: 'image/avatar-medium.png',
      profileIcon: 'image/avatar-small.png'
    }

    // Check if email exists
    UserService.doesEmailExist(user.email, function(emailExists) {

      if(emailExists) {
        response.status(400).send('This email already exists. Please try another.');
      } else {

        UserService.doesUsernameExist(user.username, function(usernameExists) {

          if(usernameExists) {
            response.status(400).send('This username already exists. Please try another.');
          } else {

            var addUser = function (_user) {
              UserService.addUser(_user, function () {
                response.sendStatus(200);
              }, function () {
                response.status(400).send('Invalid input. Please try again.');
              });
            };

            if (process.env.ENV == 'prod') {

              // Add user to SendGrid contacts
              EmailProvider.addRecipient(user, function (recipientId) {
                EmailProvider.sendWelcomeEmail(user);

                user.sendGridId = recipientId ? recipientId : '';
                addUser(user);
              });
            } else {
              addUser(user);
            }
          }
        });
      };
    });
  });

  UserRouter.post('/login', function(request, response) {

    var rollback = function() {
      response.status(400).send('Incorrect email address or password');
    };

    UserService.login(request.body.email, request.body.password, function(pUser) {

      // Set session user
      if(pUser != null) {
        request.session.user = pUser;
        response.sendStatus(200);
      } else {
        rollback();
      }

    }, rollback);
  });

  UserRouter.post('/logout', function(request, response) {

    // Destroy the session
    if(request.session.user) {
      request.session.destroy();
      response.status(200).send('You have successfully logged out.');
    } else {
      response.sendStatus(400);
    }

  });

  UserRouter.post('/remove', function(request, response) {

    var rollback = function() {response.status(400).send('Failed to delete user');};

    if(request.session.user) {
      UserService.removeUser(request.session.user.email, request.body.password, function(error, user) {
        if(error) {
          response.status(401).send('Incorrect password');
        } else if(user) {

          if(process.env.ENV == 'prod') {
            // Remove user from SendGrid contacts
            EmailProvider.removeRecipient(user.sendGridId);
          }

          // Destroy the session
          request.session.destroy();
          response.sendStatus(200);
        } else {
          rollback();
        }
      }, rollback);
    } else {
      rollback();
    }
  });

  module.exports = UserRouter;
