
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
  var AbstractObject = require('../module/common/abstract-object');
  var AbstractQueue = require('./abtract-queue');
  var GithubService = require('../service/github-service');

  // Global variables
  var pollTime = 0;
  var queueSingleton;

  // Constructor - Singleton
  var $this = function(logData) {

    if(!queueSingleton) {
      queueSingleton = $this.base.constructor.call(this, logData);
    }

    this.QUEUE = 'github_event-queue';
    this.singleton = queueSingleton;
  };

  if(!queueSingleton) {
    AbstractObject.extend(AbstractQueue, $this, {

      addQueueTask: function(task) {
        var self = this.singleton;

        // Push task onto the end of the queue if task has a lastEventId
        if(task.lastEventId) {
          self.queue.push(task, function(){});
        } else {
          // Get the index of the first task with the lastEventId attribute
          var index = self.queue.getTaskPosition('lastEventId', 0, true);
          if(index > 0) {
            self.queue.insert(index, task, function(){});
          } else {
            // If there are no tasks without lastEventId, place task on the front of the queue
            self.queue.unshift(task, function(){});
          }
        }
      },

      finishTask: function(task, logData) {
        var self = this.singleton;

        // Update poll time for next request
        pollTime = task.poll;

        // Update wait time for next request
        self.waitTime = task.wait;

        if(task.path) {
          self.queue.unshift(task);
        } else {
          GithubService.addCommits(task.screenName, task.commits, logData, function() {
            task.reset(logData);
            self.queue.push(task);
          });
        }
      },

      prepareTask: function(task) {
        if(task.lastEventId) {
          this.singleton.waitTime = pollTime;
        }
      }
    });
  }

  module.exports = $this;