
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
  /* Description: Logic for DAY_STEP database collection                     */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'day-steps-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var FITBIT_DAY_STEPS = Mongoose.Schema({
    dateTime: Date,
    fitbitId: String,
    name: String,
    screenName: String,
    steps: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  FITBIT_DAY_STEPS.statics.addDailySteps = function(dailySteps, logData, callback) {
    var updatedDailySteps = new Array();

    var dayStepsDocument = this;
    if(dailySteps.length > 0) {
      // Asynchronous method calls in loop - Using Recursion
      (function myClojure(i) {
        var daySteps = dailySteps[i];
        dayStepsDocument.findOneAndUpdate({fitbitId: daySteps.fitbitId, dateTime:daySteps.dateTime}, daySteps, {upsert:true, 'new':true}, function(error, updatedDaySteps) {
          if (error) {
            log.functionError(COLLECTION, 'addDailySteps', logData.parentProcess, logData.username,
              'Failed to upsert daySteps with fitbitId: ' + (daySteps)?daySteps.fitbitId:'invalid. Error: ' + error);
            updatedDailySteps.push({});
          } else {
            log.functionCall(COLLECTION, 'addDailySteps', logData.parentProcess, logData.username, {'fitbitId':(daySteps)?daySteps.fitbitId:'invalid', 'dateTime':(daySteps)?daySteps.dateTime:'invalid'});

            updatedDailySteps.push(updatedDaySteps);
            i++;
            if (i < dailySteps.length) {
              myClojure(i);
            } else {
              callback(updatedDailySteps);
            }
          }
        });
      })(0); // Pass i as 0 and myArray to myClojure
    } else {
      callback(updatedDailySteps);
    }
  };

  FITBIT_DAY_STEPS.statics.getDayStepsCount = function(logData, callback) {
    this.count({}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'getDayStepsCount', logData.parentProcess, logData.username, 'Failed to retrieve day-steps count: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getDayStepsCount', logData.parentProcess, logData.username);
        callback(count);
      }
    });
  };

  FITBIT_DAY_STEPS.statics.getLatestDaySteps = function(fitbitId, logData, callback) {
    this.find({fitbitId:fitbitId},{},{sort:{'dateTime':-1},limit:1}).exec(function(error, data) {
      if(error) {
        log.functionError(COLLECTION, 'getLatestDaySteps', logData.parentProcess, logData.username, 'Failed to get latest DaySteps object for user with FitbitId:' + fitbitId +
          '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getLatestDaySteps', logData.parentProcess, logData.username, {'fitbitId':fitbitId});
        callback(data[0]);
      }
    });
  };

  FITBIT_DAY_STEPS.statics.removeDailySteps = function(fitbitId, logData, callback) {
    this.remove({fitbitId:fitbitId}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeDailySteps', logData.parentProcess, logData.username, 'Failed to remove daily steps for ' + fitbitId + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'removeDailySteps', logData.parentProcess, logData.username, {'fitbitId': fitbitId});
        callback();
      }
    });
  };

  // Declare Model
  module.exports = AugeoDB.model('FITBIT_DAY_STEPS', FITBIT_DAY_STEPS);
