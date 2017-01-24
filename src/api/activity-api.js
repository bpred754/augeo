
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
  /* Description: Handles requests to Augeo's activity-api                   */
  /***************************************************************************/

  // Required libraries
  var ActivityRouter = require('express').Router();

  // Required local modules
  var ActivityService = require('../service/activity-service');
  var UserService = require('../service/user-service');
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Logger = require('../module/logger');

  // Constants
  var API = 'activity-api';
  var GET_ACTIVITY = '/getActivity';
  var GET_SKILL_ACTIVITY = '/getSkillActivity';
  var INVALID_SESSION = 'Invalid session';

  // Global variables
  var log = new Logger();

  /***************************************************************************/
  /* GET Requests                                                            */
  /***************************************************************************/

  ActivityRouter.get(GET_ACTIVITY, function(request, response) {
    var sessionUsername = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;
    var logData = AugeoUtility.formatLogData(API+GET_ACTIVITY, sessionUsername);

    var rollback = function(code, message) {
      log.functionError(API, GET_ACTIVITY, sessionUsername, message);
      response.sendStatus(code);
    };

    if(sessionUsername) {
      var activityId = request.query.activityId;
      log.functionCall(API, GET_ACTIVITY, null, sessionUsername, {'activityId':activityId});

      ActivityService.getActivity(activityId, sessionUsername, logData, function (activity) {

        if(activity) {
          UserService.getUserPublicWithId(activity.user, logData, function (activityUser) {
            var returnJson = {
              activity: activity,
              user: activityUser
            };

            response.status(200).json(returnJson);
          }, rollback);
        } else {
          rollback(400, 'Invalid activityId');
        }
      }, rollback);
    } else {
      rollback(401, INVALID_SESSION);
    }
  });

  ActivityRouter.get(GET_SKILL_ACTIVITY, function(request, response) {
    var sessionUsername = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function (code, message) {
      log.functionError(API, GET_SKILL_ACTIVITY, sessionUsername, message);
      response.sendStatus(code);
    };

    if(sessionUsername) {
      var username = request.query.username;
      var skill = request.query.skill;
      var timestamp = new Date(request.query.timestamp);

      log.functionCall(API, GET_SKILL_ACTIVITY, null, sessionUsername, {'username':username,'skill':skill,'timestamp':timestamp});
      var logData = AugeoUtility.formatLogData(API+GET_SKILL_ACTIVITY, sessionUsername);
      ActivityService.getSkillActivity(username, sessionUsername, skill, timestamp, logData, function (newData) {
        if(newData) {
          UserService.getUser(username, logData, function (targetUser) {
            newData.user = targetUser;
            response.status(200).json(newData);
          });
        } else {
          rollback(400, 'Invalid username');
        }
      }, rollback);
    } else {
      rollback(401, INVALID_SESSION)
    }
  });

  module.exports = ActivityRouter;