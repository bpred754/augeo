
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
  /* Description: Logic for ACTIVITY database collection                     */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'activity-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var ACTIVITY = Mongoose.Schema({
    classification: String,
    classificationGlyphicon: String,
    data: {type: Mongoose.Schema.Types.ObjectId, 'refPath':'kind'},
    experience: Number,
    kind: String,
    timestamp: Date,
    user: {type: Mongoose.Schema.Types.ObjectId, ref:'AUGEO_USER'}
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  ACTIVITY.statics.addActivities = function(activities, logData, callback) {

    // Add activities if they don't exist and update when they do exist
    upsertActivities(this, activities, logData, callback);
  };

  ACTIVITY.statics.addActivity = function(activity, logData, callback) {

    // Add activity if it doesn't exist and update when it does exist
    upsertActivity(this, activity, logData, callback);
  };

  ACTIVITY.statics.getActivities = function(dataId, logData, callback) {
    this.find({data:dataId}, function(error, activities) {
      if(error) {
        log.functionError(COLLECTION, 'getActivities', logData.parentProcess, logData.username, 'Failed to get activities with dataId: ' + dataId
          + '. Error: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getActivities', logData.parentProcess, logData.username, {"dataId":dataId});
        callback(activities);
      }
    });
  };

  ACTIVITY.statics.getActivity = function(userId, dataId, logData, callback) {
    this.findOne({$and:[{user:userId}, {data:dataId}]}, function(error, activity) {
      if(error) {
        log.functionError(COLLECTION, 'getActivity', logData.parentProcess, logData.username, 'Failed to get activity for user with ID: ' + userId +
          '. Error: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getActivity', logData.parentProcess, logData.username, {'userId': userId, 'dataId': dataId});
        callback(activity);
      }
    });
  };

  ACTIVITY.statics.getSkillActivity = function(userId, skill, limit, maxTimestamp, logData, callback) {
    var model = this;

    if(!maxTimestamp) {
      maxTimestamp = new Date(8640000000000000);
    }

    var query = {
      $and:[
        {
          user: userId,
          timestamp: {$lt: maxTimestamp}
        }
      ]
    };

    if(skill && skill != 'Augeo') {
      query.classification = skill;
    }

    // First grab the activity IDs
    model.find(query)
      .select('_id')
      .sort({'timestamp': -1})
      .limit(limit)
      .lean()
      //.populate('data') // Can't use populate & sort due to Mongoose issue: https://github.com/Automattic/mongoose/issues/2202
      .exec(function(error, activityIds) {
        if(error) {
          log.functionError(COLLECTION, 'getSkillActivity', logData.parentProcess, logData.username,
            'Failed to retrieve ' + userId + ' activity IDs for skill:' + skill + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getSkillActivity', logData.parentProcess, logData.username,
            {'userId':userId, 'skill':skill,'maxTimestamp':maxTimestamp}, 'Retrieved activity IDs');

          // Second, get all populated objects
          // Can't use MongoDB's $in function because of issue with mongoose populate
          var activities = new Array();
          if(activityIds && activityIds.length > 0) {

            // Asynchronous method calls in loop - Using Recursion
            (function myClojure(i) {
              model.findOne({'_id':activityIds[i]})
                .populate('data')
                .lean()
                .exec(function(error, activity) {

                  if(error) {
                    log.functionError(COLLECTION, 'getSkillActivity', logData.parentProcess, logData.username,
                      'Failed to retrieve activity with id: ' + activityIds[i]);
                    callback();
                  } else {

                    activities.push(activity);
                    i++;
                    if (i < activityIds.length) {
                      myClojure(i);
                    } else {
                      log.functionCall(COLLECTION, 'getSkillActivity', logData.parentProcess, logData.username, {'activityId':activityIds[i]},
                        'Retrieved populated activities');

                      // Sort activities by timestamp in descending order
                      var sortedActivities = activities.sort(function (a, b) {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                      });

                      callback(sortedActivities);
                    }
                  }
              });
            })(0); // Pass i as 0 and myArray to myClojure
          } else {
            callback(activities);
          }
        }
      });
  };

  ACTIVITY.statics.getUserActivities = function(userId, logData, callback) {
    this.find({user:userId}, function(error, activities) {
      if(error) {
        log.functionError(COLLECTION, 'getUserActivities', logData.parentProcess, logData.username, {'userId':userId});
        callback();
      } else {
        log.functionCall(COLLECTION, 'getUserActivities', logData.parentProcess, logData.username, {'userId':userId});
        callback(activities);
      }
    });
  };

  ACTIVITY.statics.increaseExperience = function(userId, dataId, experience, logData, callback) {
    this.findOneAndUpdate({$and:[{user:userId}, {data:dataId}]}, {$inc:{experience:experience}}, {'new':true}, function(error, activity) {
      if(error) {
        log.functionError(COLLECTION, 'increaseExperience', logData.parentProcess, logData.username, 'Failed to increase activity with data ID:' +
          dataId + ' . Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'increaseExperience', logData.parentProcess, logData.username, {'userId':userId, 'dataId':dataId, 'experience':experience});
        callback(activity);
      }
    });
  };

  ACTIVITY.statics.removeActivities = function(userId, logData, callback) {
    this.remove({user:userId}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeActivities', logData.parentProcess, logData.username, 'Failed to remove activities with userId: ' + userId
          + '. Error: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'removeActivities', logData.parentProcess, logData.username, {'userId': userId});
        callback();
      }
    });
  };

  ACTIVITY.statics.removeActivity = function(userId, dataId, logData, callback) {
    this.remove({$and:[{user:userId},{data:dataId}]}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeActivity', logData.parentProcess, logData.username, 'Failed to remove activity with userId: ' + userId
          + '. Error: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'removeActivity', logData.parentProcess, logData.username, {'userId': userId, dataId:dataId});
        callback();
      }
    });
  };

  ACTIVITY.statics.updateClassification = function(activityId, classification, classificationGlyphicon, logData, callback) {
    this.findOneAndUpdate({_id: activityId}, {$set:{classification: classification, classificationGlyphicon:classificationGlyphicon}}, {new: true}, function(error, activity) {
      if(error) {
        log.functionError(COLLECTION, 'updateClassification', logData.parentProcess, logData.username, 'Failed to update activitys classification with activityId: ' + activityId);
        callback();
      } else {
        log.functionCall(COLLECTION, 'updateClassification', logData.parentProcess, logData.username, {'activity':activityId, 'classification':classification});
        callback(activity);
      }
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var upsertActivity = function(activityDocument, activity, logData, callback) {
    activityDocument.findOne({$and:[{user:activity.user},{data:activity.data}]}, function(error, foundActivity) {

      if(error) {
        log.functionError(COLLECTION, 'upsertActivity (private)', logData.parentProcess, logData.username,
          'Failed to find activity with data ID: ' + (activity) ? activity.data : 'invalid');
        callback();
      } else {

        var duplicateExperience = 0;
        if (foundActivity && typeof foundActivity.experience == 'number') {

          // Grab current experience so it's not duplicated in user's experience
          duplicateExperience = foundActivity.experience;

          // Use the current classification and glyphicon
          activity.classification = foundActivity.classification;
          activity.classificationGlyphicon = foundActivity.classificationGlyphicon;
        }

        activityDocument.findOneAndUpdate({$and: [{user: activity.user}, {data: activity.data}]}, activity, { upsert: true, 'new': true},
          function (error, updatedActivity) {
          if (error) {
            log.functionError(COLLECTION, 'upsertActivity (private)', logData.parentProcess, logData.username,
              'Failed to upsert activity with data ID: ' + (activity) ? activity.data : 'invalid' + '. Error: ' + error);
            callback();
          } else {
            log.functionCall(COLLECTION, 'upsertActivity (private)', logData.parentProcess, logData.username, {
              'activityDocument': (activityDocument) ? 'defined' : 'invalid',
              'activity.data': (activity) ? activity.data : 'invalid'
            });

            // Add attribute for duplicate experience
            updatedActivity.duplicateExperience = duplicateExperience;

            callback(updatedActivity);
          }
        });
      }
    });
  };

  var upsertActivities = function(activityDocument, activities, logData, callback) {
    var updatedActivities = new Array();

    if(activities.length > 0) {
      // Asynchronous method calls in loop - Using Recursion
      (function myClojure(i) {
        upsertActivity(activityDocument, activities[i], logData, function (updatedActivity) {
          if(updatedActivity) {
            updatedActivities.push(updatedActivity);
          }
          i++;
          if (i < activities.length) {
            myClojure(i);
          } else {
            callback(updatedActivities);
          }
        });
      })(0); // Pass i as 0 and myArray to myClojure
    } else {
      callback();
    }
  };

  // Declare Model
  module.exports = AugeoDB.model('ACTIVITY', ACTIVITY);