
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
  /* Description: Abstract queue to handle interface rate limits             */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var Async = require('../module/queue');
  var Logger = require('../module/logger');

  // Global variables
  var log = new Logger();

  var $this = function(logData) {
    $this.base.constructor.call(this);

    // Public variables
    this.currentTask = {};
    this.isBusy = false;
    this.isQueueOpen = true;
    this.queue = null;
    this.removeCurrentTask = false;

    // Override in child objects
    this.maxTaskExecutionTime = 0;
    this.taskWaitTime = 0;
    this.QUEUE = 'base-queue';

    this.init(logData);
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    getUserWaitTime: function(userId, logData) {
      log.functionCall(this.QUEUE, 'getUserWaitTime', logData.parentProcess, logData.username, {'userId':userId});

      var waitTime = -1;

      // Don't set wait time for polling tasks (only possible for revolving queues)
      if(!this.isRevolvingQueue || (this.isRevolvingQueue && !this.currentTask.isPoll)) {

        // Check if the current task is for the userId passed in
        if (this.currentTask && this.currentTask.user && this.currentTask.user._id.equals(userId)) {
          waitTime = this.maxTaskExecutionTime;
        } else { // If the current task is not for the userId then find the userId in the queue
          var taskPosition = this.queue.getUserTaskPosition(userId);
          if (taskPosition != -1) {
            waitTime = this.maxTaskExecutionTime * (taskPosition + 2);
          }
        }
      }
      return waitTime;
    },

    getWaitTime: function(logData) {
      log.functionCall(this.QUEUE, 'getWaitTime', logData.parentProcess, logData.username);

      var queueNumber = this.queue.tasks.length;
      if(this.currentTask && this.currentTask.user) {
        queueNumber++;
      }

      return this.maxTaskExecutionTime * queueNumber;
    },

    isAddRequestValid: function(task, callback) {

      var isAddRequestValid = true;
      if(this.currentTask.user && this.currentTask.user._id.equals(task.user._id)) {
        isAddRequestValid = false;
      } else {

        var tasks = this.queue.tasks;
        for(var i = 0; i < tasks.length; i++) {
          if(tasks[i].data.user._id.equals(task.user._id)) {
            isAddRequestValid = false;
          }
        }
      }
      callback(isAddRequestValid);
    },

    finishTask: function() {},

    init: function(logData) {

      var self = this;
      this.queue = Async.queue(function(task, callback) {
        log.functionCall(self.QUEUE, 'Async.queue', logData.parentProcess, logData.username, {}, 'Executing queue task');

        self.currentTask = task;
        self.prepareTask(task);
        self.startQueueTimer(logData);

        self.onRequestOpen(function() {

          self.isBusy = true;
          task.execute(logData, function(executeData) {

            var finalize = function(callback) {
              if (self.queue.tasks.length == 0) {
                self.isBusy = false;
              }

              // Reset current task
              self.currentTask = {};

              callback();
            };

            if(!self.removeCurrentTask) {
              self.finishTask(executeData, logData, function () {
                finalize(callback);
              });
            } else {
              self.removeCurrentTask = false;
              finalize(callback);
            }
          });
        });
      });
    },

    onRequestOpen: function(callback) {
      var self = this;
      if(this.isQueueOpen == true) {
        callback();
      } else {
        setTimeout(function() {self.onRequestOpen(callback)}, 100);
      }
    },

    prepareTask: function(task) {
      if(this.isBusy) {
        this.taskWaitTime = task.wait;
      } else {
        this.taskWaitTime = 0;
      }
    },

    removeUserTask: function(userId) {

      // Check if the current task is for the userId passed in
      if (this.currentTask && this.currentTask.user && this.currentTask.user._id.equals(userId)) {
        this.removeCurrentTask = true;
      } else { // If the current task is not for the userId then find the userId in the queue
        var taskPosition = this.queue.getUserTaskPosition(userId);
        if (taskPosition > -1) {
          this.queue.tasks.splice(taskPosition, 1);
        }
      }
    },

    startQueueTimer: function(logData) {
      log.functionCall(this.QUEUE, 'startQueueTimer', logData.parentProcess, logData.username, {'taskWaitTime':this.taskWaitTime});

      var self = this;
      this.isQueueOpen = false;
      setTimeout(function() {
        self.isQueueOpen = true;
      }, self.taskWaitTime);
    }
  });

  module.exports = $this;