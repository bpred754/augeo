
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

  var $this = function(logData) {

    $this.base.constructor.call(this);

    // Public variables
    this.QUEUE = 'abstract-queue'; // Override in child object
    this.currentTask = {};
    this.isQueueOpen = true;
    this.queue = null;
    this.waitTime = 0;

    this.init(logData);

    // Return abstract queue object so singleton queues can store reference
    return this;
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    addQueueTask: function(){}, // Override in child object

    addTask: function(task, logData) {
      log.functionCall(this.singleton.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName':(task)?task.screenName:'invalid'});

      var self = this.singleton;

      var isAddRequestValid = true;
      if(task.userId == self.currentTask.userId) {
        isAddRequestValid = false;
      } else {

        var tasks = self.queue.tasks;
        for(var i = 0; i < tasks.length; i++) {
          if(tasks[i].data.userId == task.userId) {
            isAddRequestValid = false;
          }
        }
      }

      if(isAddRequestValid) {
        task.wait = self.waitTime;
        self.addQueueTask(task);
      } else {
        log.functionCall(self.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName':(task)?task.screenName:'invalid'},
          'User already on queue');
      }
    },

    finishTask: function(){}, // Override in child object

    init: function(logData) {
      log.functionCall(this.QUEUE, 'init', logData.parentProcess, logData.username);

      var self = this;
      self.queue = Async.queue(function(task, callback) {
        log.functionCall(self.QUEUE, 'Async.queue', logData.parentProcess, logData.username, {}, 'Executing queue task');

        self.onRequestOpen(function() {

          self.currentTask = task;
          self.prepareTask(task);
          self.startQueueTimer();

          task.execute(logData, function(updatedTask) {
            self.finishTask(updatedTask, logData);

            // Reset current task
            self.currentTask = {};

            callback();
          });
        });
      });
    },

    onRequestOpen: function(callback) {
      var self = this.singleton;
      if(self.isQueueOpen == true) {
        callback();
      } else {
        setTimeout(function() {self.onRequestOpen(callback)}, 100);
      }
    },

    prepareTask: function(){}, // Override in child object

    startQueueTimer: function() {
      var self = this.singleton;

      self.isQueueOpen = false;
      setTimeout(function() {
        self.isQueueOpen = true;
      }, self.waitTime);
    }
  });

  module.exports = $this;