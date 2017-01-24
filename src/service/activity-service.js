
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
  /* Description: Handles logic interfacing with ACTIVITY collection         */
  /***************************************************************************/

  // Required local modules
  var AugeoDB = require('../model/database');
  var AugeoValidator = require('../validator/augeo-validator');
  var Logger = require('../module/logger');

  // Constants
  var ACTIVITY_PER_PAGE = 20;
  var SERVICE = 'activity-service';

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');
  var User = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  exports.getActivity = function(activityId, sessionUsername, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getActivity', logData.parentProcess, logData.username, {'activityId': activityId});

    if(activityId && AugeoValidator.isMongooseObjectIdValid(activityId, logData)) {
      Activity.getActivityWithId(activityId, logData, function(activity) {

        if(activity) {
          activity.suggestedClassification = activity.classification;

          // See if there is a staged flag for the current user and activityId
          var activityIds = new Array();
          activityIds.push(activityId);

          StagedFlag.getStagedFlagsWithActivityIds(activityIds, sessionUsername, logData, function(stagedFlags) {
            if(stagedFlags) {
              var activities = new Array();
              activities.push(activity);

              activities = addSuggestedClassificationsToActivities(activities, stagedFlags);
              callback(activities[0]);
            } else {
              callback(activity);
            }
          });
        } else {
          rollback(400, 'Invalid activityId');
        }
      });
    } else {
      rollback(400, 'Invalid activityId');
    }
  };

  exports.getSkillActivity = function(username, sessionUsername, skill, timestamp, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getSkillActivity', logData.parentProcess, logData.username, {'username':username, 'skill':skill,
      'timestamp':timestamp});

    if(AugeoValidator.isUsernameValid(username, logData)) {

      User.getUserWithUsername(username, logData, function(user) {

        if(user) {
          if (AugeoValidator.isSkillValid(skill, logData) && AugeoValidator.isTimestampValid(timestamp, logData)) {
            Activity.getSkillActivity(user._id, skill, ACTIVITY_PER_PAGE, timestamp, logData, function(activities) {

              // Build array of activity Ids and initialize suggestedClassifications
              var activityIds = new Array();
              for(var i = 0; i < activities.length; i++) {
                activityIds.push(activities[i]._id);

                activities[i].suggestedClassification = activities[i].classification;
              }

              // Get all staged flags by this user
              StagedFlag.getStagedFlagsWithActivityIds(activityIds, sessionUsername, logData, function(stagedFlags) {

                // Set callback data
                var data = {
                  activity: addSuggestedClassificationsToActivities(activities, stagedFlags)
                };

                callback(data);
              });
            });
          } else {
            rollback(400, 'Invalid skill or timestamp');
          }
        } else {
          callback();
        }
      });
    } else {
      rollback(404, 'Invalid username');
    }
  };

  exports.removeActivities = function(userId, logData, callback, rollback) {
    log.functionCall(SERVICE, 'removeActivities', logData.parentProcess, logData.username, {'userId': userId});

    if(AugeoValidator.isMongooseObjectIdValid(userId, logData)){
      Activity.removeActivities(userId, logData, callback);
    } else {
      rollback(400, 'Failed to remove activities - userId is invalid');
    }
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  var addSuggestedClassificationsToActivities = function(activities, stagedFlags) {
    for(var i = 0; i < stagedFlags.length; i++) {
      var stagedFlag = stagedFlags[i];
      for(var j = 0; j < activities.length; j++) {
        if(stagedFlag.activityId.equals(activities[j]._id)) {
          activities[j].suggestedClassification = stagedFlag.suggestedClassification;
        }
      }
    }
    return activities;
  };

