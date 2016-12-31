
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
  /* Description: Object to manage Reclassify queue tasks                    */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../../public/javascript/common/abstract-object');
  var AbstractQueueTask = require('../abstract-queue-task');
  var AugeoUtility = require('../../utility/augeo-utility');
  var AugeoDB = require('../../model/database');
  var Logger = require('../../module/logger');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var Flag = AugeoDB.model('AUGEO_FLAG');
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');
  var User = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  // Constants
  var TASK = 'reclassify-queue-task';

  // Constructor
  var $this = function(logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username);

    // public variables
    this.executeDate;
    this.isPoll = false; // Required field for revolving queues
  };

  AbstractObject.extend(AbstractQueueTask, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      var self = this;

      // Get this task's reclassifying date
      var taskDate = AugeoUtility.calculateReclassifyDate(Date.now(), 0, logData);

      // Get all staged flags with this task's reclassifying date
      StagedFlag.getStagedFlags(taskDate, logData, function(stagedFlags) {

        if(stagedFlags.length > 0) {

          // Create a dictionary with the activity id as the key
          // layout: {key: {currentClassification: String, stagedFlags: Array, votes: Array}}
          var dictionary = {};

          // Create an array to store the dictionary keys
          var dictionaryKeys = new Array();

          // Loop through the stage flags and populate the dictionary
          for (var i = 0; i < stagedFlags.length; i++) {
            var stagedFlag = stagedFlags[i];

            if (!dictionary[stagedFlag.activityId]) {
              dictionaryKeys.push(stagedFlag.activityId);
              dictionary[stagedFlag.activityId] = {};
              dictionary[stagedFlag.activityId].stagedFlags = new Array();
              dictionary[stagedFlag.activityId].votes = new Array();
              for (var j = 0; j < AugeoUtility.SUB_SKILLS.length; j++) {
                dictionary[stagedFlag.activityId].votes[j] = 0;
              }
              dictionary[stagedFlag.activityId].currentClassification = stagedFlag.currentClassification;
            }

            dictionary[stagedFlag.activityId].stagedFlags.push(stagedFlag);
            dictionary[stagedFlag.activityId].votes[AugeoUtility.getSkillIndex(stagedFlag.suggestedClassification, logData)] += stagedFlag.votes;
          }

          // Asynchronously Loop through the activity ids in the dictionary and determine if the activity should be reclassified
          (function activityAsyncIterator(i) {
            var key = dictionaryKeys[i];

            var nextActivityAsyncIteration = function() {
              i++;
              if (i < dictionaryKeys.length) {
                activityAsyncIterator(i);
              } else {
                callback(self);
              }
            };

            // Get the classification index with the most votes
            var maxIndex = 0;
            var max = 0;
            for (var j = 0; j < dictionary[key].votes.length; j++) {
              if (dictionary[key].votes[j] > max) {
                max = dictionary[key].votes[j];
                maxIndex = j;
              }
            }

            // If the activity with activityId should be reclassified, then..
            if (max >= AugeoUtility.ADMIN_RECLASSIFY_VOTES) {
              var oldClassification = dictionary[key].currentClassification;
              var newClassification = AugeoUtility.SUB_SKILLS[maxIndex].name;
              var newClassificationGlyphicon = AugeoUtility.getGlyphicon(newClassification, logData);

              // Update the activity classification
              Activity.updateClassification(key, newClassification, newClassificationGlyphicon, logData, function (updatedActivity) {

                // Build skill data
                var subSkillsExperience = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, logData);
                subSkillsExperience[newClassification] = updatedActivity.experience;
                subSkillsExperience[oldClassification] = -1 * updatedActivity.experience;
                subSkillsExperience['Community'] += AugeoUtility.FLAG_EXPERIENCE;

                var experience = {
                  mainSkillExperience: AugeoUtility.FLAG_EXPERIENCE,
                  subSkillsExperience: subSkillsExperience
                };

                // Update the activity user's subskill experience
                User.updateSkillData(updatedActivity.user, experience, logData, function () {

                  // Asynchronously loop through the activity's staged flags
                  var activityStagedFlags = dictionary[key].stagedFlags;
                  (function stagedActivityAsyncIterator(k) {
                    var activityStagedFlag = activityStagedFlags[k];

                    var nextStagedActivityIteration = function () {
                      k++;
                      if (k < activityStagedFlags.length) {
                        stagedActivityAsyncIterator(k);
                      } else {
                        nextActivityAsyncIteration();
                      }
                    };

                    // Determine if the activity's staged flag had the correct vote
                    if (activityStagedFlag.suggestedClassification === newClassification) {

                      // Get the flaggee's username
                      User.getUserWithId(updatedActivity.user, logData, function(flaggee) {

                        // Add the staged flag to the AUGEO_FLAG collection
                        var flag = {
                          activity: stagedFlag.activityId,
                          flaggee: flaggee.username,
                          newClassification: newClassification,
                          previousClassification: oldClassification,
                          reclassifiedDate: stagedFlag.reclassifyDate
                        };

                        Flag.addFlag(flag, logData, function (addedFlag) {

                          // Create a new activity for the successful flag
                          var activity = flag;
                          activity.classification = 'Community';
                          activity.classificationGlyphicon = AugeoUtility.getGlyphicon('Community', logData);
                          activity.data = addedFlag._id;
                          activity.experience = AugeoUtility.FLAG_EXPERIENCE;
                          activity.kind = 'AUGEO_FLAG';
                          activity.timestamp = stagedFlag.timestamp;
                          activity.user = updatedActivity.user;

                          Activity.addActivity(activity, logData, function (addedActivity) {
                            nextStagedActivityIteration();
                          });
                        });
                      });
                    } else { // Activity did not have the correct vote
                      nextStagedActivityIteration();
                    }
                  })(0);
                });
              });
            } else {
              nextActivityAsyncIteration();
            }
          })(0);
        } else {
          callback(self);
        }
      });
    }
  });

  module.exports = $this;

