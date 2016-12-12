
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
  /* Description: Object to manage Fitbit event queue tasks                  */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../../public/javascript/common/abstract-object');
  var AbstractQueueTask = require('../abstract-queue-task');
  var FitbitInterfaceService = require('../../interface-service/fitbit-interface-service');
  var FitbitUser = require('../../model/schema/fitbit/user');
  var Logger = require('../../module/logger');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'fitbit-queue-task';

  // Access with $this.variable inside of class and class.variable outside
  function publicStaticVariables($this)
  {
    $this.MAX_EXECUTION_TIME = 1;
  }

  // Constructor
  var $this = function(user, fitbitData, lastDateTime, logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username, {'userId': (user)?user._id:'invalid',
      'fitbitId': (fitbitData)?fitbitData.fitbitId:'invalid', 'lastDateTime': lastDateTime});

    // Call parent constructor
    $this.base.constructor.call(this, user);

    // public variables
    this.fitbitData = fitbitData;
    this.dailySteps = new Array();
    this.isFirstRequestInQueue = false;
    this.isPoll = false; // Required field for revolving queues
    this.lastDateTime = lastDateTime;
  };

  publicStaticVariables($this);

  AbstractObject.extend(AbstractQueueTask, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      // Determine the period for the amount of dates to retrieve
      var diffDays = 999;
      if(this.lastDateTime && this.lastDateTime instanceof Date) {
        var currentDate = new Date();
        var timeDiff = Math.abs(currentDate.getTime() - this.lastDateTime.getTime());
        diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      var period = '1d';
      if(diffDays > 1) {
        period = '7d'
      }
      if(diffDays > 6) {
        period = '30d';
      }
      if(diffDays > 27) {
        period = '3m';
      }
      if(diffDays > 81) {
        period = '6m';
      }
      if(diffDays > 162) {
        period = '1y'
      }

      var task = this;
      FitbitInterfaceService.getSteps(this.fitbitData, period, logData, function(data) {

        var newSteps = new Array();

        if(data instanceof Array) {
          var dailySteps = data;
          var lastDayStepsDate = new Date(task.lastDateTime).setHours(0, 0, 0, 0);

          for (var i = 0; i < dailySteps.length; i++) {

            var dayStepDate = new Date(dailySteps[i].dateTime).setHours(0, 0, 0, 0);
            if (dayStepDate > lastDayStepsDate) {
              newSteps.push(dailySteps[i])
            }
          }

          task.dailySteps = newSteps;
          callback(task);
        } else if (data == 'expired_token') {

          FitbitInterfaceService.refreshAccessToken(task.fitbitData.refreshToken, logData, function(tokens) {
            FitbitUser.updateAccessTokens(task.fitbitData.fitbitId, tokens, logData, function(updatedUser) {
              task.dailySteps = newSteps;
              callback(task);
            });
          });
        } else {
          task.dailySteps = newSteps;
          callback(task);
        }
      });
    },

    reset: function(logData) {

      if (this.dailySteps.length > 0) {
        this.lastDateTime = this.dailySteps[this.dailySteps.length - 1].dateTime;
        this.dailySteps.length = 0;
      }
    }
  });

  module.exports = $this;

