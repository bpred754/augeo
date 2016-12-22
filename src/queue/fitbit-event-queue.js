
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
  /* Description: Queue to handle Fitbit's rate limit                        */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var BaseQueue = require('./base-queue');
  var FitbitQueueTask = require('../queue-task/fitbit/fitbit-event-task');
  var FitbitService = require('../service/fitbit-service');
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');

  // Global variables
  var log = new Logger();

  var $this = function(logData) {
    var queueType = 'fitbit-event-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;

    // Public variables
    this.isRevolvingQueue = true;
    this.maxTaskExecutionTime = FitbitQueueTask.MAX_EXECUTION_TIME;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addAllUsers: function(logData, callback){
      log.functionCall(this.QUEUE, 'addAllUsers', logData.parentProcess, logData.username);

      var self = this;
      FitbitService.loopThroughUsersQueueData(logData, function(queueData) {
        var user = queueData.user;
        var lastDateTime = (queueData.lastDateTime) ? queueData.lastDateTime.getTime() : null;
        var task = new FitbitQueueTask(user.augeoUser, user, lastDateTime, logData);
        self.addTask(task, logData)
      }, callback);
    },

    addTask: function(task, logData) {
      log.functionCall(this.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.fitbitId':(task)?task.fitbitId:'invalid'});

      var self = this;
      this.isAddRequestValid(task, function(isAddRequestValid) {
        if(isAddRequestValid) {
          var queue = self.queue;

          // Check if it's the first task in the queue
          if(queue.tasks.length == 0 && !self.isBusy) {
            task.isFirstRequestInQueue = true;
          }

          queue.push(task, function () {});
        } else {
          if(task) {
            log.functionCall(self.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.user.fitbitId': (task.user)?task.user.fitbitId:'invalid'}, 'User already on queue');
          }
        }
      });
    },

    finishTask: function(task, logData, callback) {
      var self = this;
      if(task.dailySteps.length > 0) {
        FitbitService.addDailySteps(task.dailySteps, logData, function () {
          UserService.updateAllRanks(logData, function () {
            task.reset(logData);
            self.queue.push(task, logData);
            callback();
          });
        });
      } else {
        self.queue.push(task, logData);
        callback();
      }
    },

    kill: function() {
      this.queue.kill();
    },

    prepareTask: function(task) {
      if(task.isFirstRequestInQueue == true) {
        this.taskWaitTime = 300000;
      } else {
        this.taskWaitTime = 0;
      }
    }

  });

  module.exports = $this;

