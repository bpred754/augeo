
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
  /* Description: Handles requests to Augeo's admin-api                      */
  /***************************************************************************/

  // Required libraries
  var AdminRouter = require('express').Router();

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');

  // Constants
  var API = 'admin-api';
  var INVALID_SESSION = 'Invalid session';
  var SET_LOG_LEVEL = '/setLogLevel';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* POST Requests                                                           */
  /***************************************************************************/

  AdminRouter.get(SET_LOG_LEVEL, function(request, response) {

    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(code, message) {
      log.functionError(API, SET_LOG_LEVEL, username, message);
      response.status(code).send(message);
    };

    if(username) {
      log.functionCall(API, SET_LOG_LEVEL, null, username, {});
      var logData = AugeoUtility.formatLogData(API+SET_LOG_LEVEL, username);

      // Verify user is an admin user
      UserService.isAdmin(username, logData, function(isAdmin) {

        if(isAdmin) {
          response.json(request.query);

          if(request.query.logApi) {
            log.setLogApi(request.query.logApi);
          }

          if(request.query.logClassifier) {
            log.setLogClassifier(request.query.logClassifier);
          }

          if(request.query.logCollection) {
            log.setLogCollection(request.query.logCollection);
          }

          if(request.query.logInterface) {
            log.setLogInterface(request.query.logInterface);
          }

          if(request.query.logInterfaceService) {
            log.setLogInterfaceService(request.query.logInterfaceService);
          }

          if(request.query.logModule) {
            log.setLogModule(request.query.logModule);
          }

          if(request.query.logQueue) {
            log.setLogQueue(request.query.logQueue);
          }

          if(request.query.logService) {
            log.setLogService(request.query.logService);
          }

          if(request.query.logUtility) {
            log.setLogUtility(request.query.logUtility);
          }

          if(request.query.logValidator) {
            log.setLogValidator(request.query.logValidator);
          }

        } else {
          rollback(400, 'Not an admin user');
        }
      });

    } else {
      rollback(401, INVALID_SESSION);
    }

  });

  module.exports = AdminRouter;
