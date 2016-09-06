
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
  var GithubQueueTask = require('../queue-task/github-queue-task');
  var GithubService = require('../service/github-service');
  var Logger = require('../module/logger');

  // Constants
  var QUEUE = 'github_event-queue';

  // Global variables
  var log = new Logger();
  var pollTime = 0;
  var baseQueue;

  var $this = function(logData) {
    $this.base.constructor.call(this);

    if(!baseQueue) {
      log.functionCall(QUEUE, 'init', logData.parentProcess, logData.username);

      logData.queue = QUEUE;
      baseQueue = new BaseQueue(logData, prepareTask, finishTask);
    }
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    addAllUsers: function(logData){
      log.functionCall(QUEUE, 'addAllUsers', logData.parentProcess, logData.username);

      var self = this;
      GithubService.loopThroughUsersQueueData(logData, function(queueData) {
        var user = queueData.user;
        var task = new GithubQueueTask(user.augeoUser, user.screenName, user.accessToken, queueData.eventId, logData);
        self.addTask(task, logData)
      });
    },

    addTask: function(task, logData) {
      log.functionCall(QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName':(task)?task.screenName:'invalid'});

      baseQueue.updateWaitTime(task, function(updatedTask) {
        if(updatedTask) {
          var queue = baseQueue.queue;

          // Push task onto the end of the queue if task has a lastEventId
          if (updatedTask.lastEventId) {
            queue.push(updatedTask, function () {});
          } else {
            // Get the index of the first task with the lastEventId attribute
            var index = queue.getTaskPosition('lastEventId', 0, true);
            if (index > 0) {
              queue.insert(index, updatedTask, function () {});
            } else {
              // If there are no tasks without lastEventId, place task on the front of the queue
              queue.unshift(updatedTask, function () {});
            }
          }
        } else {
          log.functionCall(QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName': (task) ? task.screenName : 'invalid'}, 'User already on queue');
        }
      });
    }
  });

  module.exports = $this;

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var finishTask = function(task, logData) {

    // Update poll time for next request
    pollTime = task.poll;

    // Update wait time for next request
    baseQueue.waitTime = task.wait;

    var queue = baseQueue.queue;
    if(task.path) {
      queue.unshift(task);
    } else {
      GithubService.addCommits(task.screenName, task.commits, logData, function() {
        task.reset(logData);
        queue.push(task);
      });
    }
  };

  var prepareTask = function(task) {
    if(task.lastEventId) {
      baseQueue.waitTime = pollTime;
    }
  };