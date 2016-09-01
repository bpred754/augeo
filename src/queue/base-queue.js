
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
  var AbstractObject = require('../module/common/abstract-object');
  var Async = require('../module/queue');
  var Logger = require('../module/logger');

  // Global variables
  var log = new Logger();

  var $this = function(logData, prepareTask, finishTask) {
    $this.base.constructor.call(this);

    // Public variables
    this.currentTask = {};
    this.isQueueOpen = true;
    this.queue = null;
    this.waitTime = 0;

    this.init(logData, prepareTask, finishTask);
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    updateWaitTime: function(task, callback) {

      var isAddRequestValid = true;
      if(task.userId == this.currentTask.userId) {
        isAddRequestValid = false;
      } else {

        var tasks = this.queue.tasks;
        for(var i = 0; i < tasks.length; i++) {
          if(tasks[i].data.userId == task.userId) {
            isAddRequestValid = false;
          }
        }
      }

      if(isAddRequestValid) {
        task.wait = this.waitTime;
        callback(task)
      } else {
        callback();
      }
    },

    init: function(logData, prepareTask, finishTask) {

      var self = this;
      this.queue = Async.queue(function(task, callback) {
        log.functionCall(logData.queue, 'Async.queue', logData.parentProcess, logData.username, {}, 'Executing queue task');

        self.onRequestOpen(function() {

          self.currentTask = task;
          prepareTask(task);
          self.startQueueTimer();

          task.execute(logData, function(updatedTask) {
            finishTask(updatedTask, logData);

            // Reset current task
            self.currentTask = {};

            callback();
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

    startQueueTimer: function() {
      var self = this;
      this.isQueueOpen = false;
      setTimeout(function() {
        self.isQueueOpen = true;
      }, self.waitTime);
    }
  });

  module.exports = $this;