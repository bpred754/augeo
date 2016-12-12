
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
  /* Description: Queue to handle Github's rate limit                        */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var BaseQueue = require('./base-queue');
  var GithubQueueTask = require('../queue-task/github/github-event-task');
  var GithubService = require('../service/github-service');
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');

  // Global variables
  var log = new Logger();
  var pollTime = 0;

  var $this = function(logData) {
    var queueType = 'github-event-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;

    // Public variables
    this.isRevolvingQueue = true;
    this.maxTaskExecutionTime = GithubQueueTask.MAX_EXECUTION_TIME;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addAllUsers: function(logData, callback){
      log.functionCall(this.QUEUE, 'addAllUsers', logData.parentProcess, logData.username);

      var self = this;
      GithubService.loopThroughUsersQueueData(logData, function(queueData) {
        var user = queueData.user;
        var task = new GithubQueueTask(user.augeoUser, user, queueData.eventId, logData);
        self.addTask(task, logData)
      }, callback);
    },

    addTask: function(task, logData) {
      log.functionCall(this.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName':(task)?task.screenName:'invalid'});

      var self = this;
      this.isAddRequestValid(task, function(isAddRequestValid) {
        if(isAddRequestValid) {
          var queue = self.queue;

          // Get the index of the first task with the lastEventId attribute
          var index = queue.doesValueExist('lastEventId');

          // Push task onto the end of the queue if task has a lastEventId OR if no tasks in queue have lastEventId attribute
          if (task.lastEventId || index == -1) {
            queue.push(task, function () {});
          } else {
            queue.insert(index, task, function () {});
          }
        } else {
          log.functionCall(self.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName': (task) ? task.screenName : 'invalid'}, 'User already on queue');
        }
      });
    },

    finishTask: function(task, logData, callback) {

      // Update poll time for next request
      pollTime = task.poll;

      // Update wait time for next request
      this.taskWaitTime = task.wait;

      var queue = this.queue;
      var finalize = function() {
        task.reset(logData);
        queue.push(task);
        callback();
      };

      if(task.path) {
        queue.unshift(task);
        callback();
      } else {
        if(task.commits.length > 0) {
          GithubService.addCommits(task.screenName, task.commits, logData, function () {
            UserService.updateAllRanks(logData, function () {
              finalize();
            });
          });
        } else {
          finalize();
        }
      }
    },

    getPollTime: function() {
      return pollTime;
    },

    prepareTask: function(task) {
      if(task.isPoll) {
        this.taskWaitTime = pollTime;
      }
    },

    reset: function() {
     this.queue.tasks.length = 0;
    }

  });

  module.exports = $this;

