
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
  /* Description: Queue to handle Twitter's rate limit                       */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var BaseQueue = require('./base-queue');
  var Logger = require('../module/logger');
  var TwitterMentionTask = require('../queue-task/twitter/event/twitter-mention-task');
  var TwitterService = require('../service/twitter-service');
  var TwitterTweetTask = require('../queue-task/twitter/event/twitter-tweet-task');
  var UserService = require('../service/user-service');

  // Global variables
  var log = new Logger();

  var $this = function(logData, isMention) {
    var queueType = (isMention)?'mention-event-queue':'tweet-event-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;

    // Public variables
    this.isMention = isMention;
    this.maxTaskExecutionTime = (this.isMention)?TwitterMentionTask.MAX_EXECUTION_TIME:TwitterTweetTask.MAX_EXECUTION_TIME;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addAllUsers: function(logData){
      log.functionCall(this.QUEUE, 'addAllUsers', logData.parentProcess, logData.username);

      var self = this;
      TwitterService.loopThroughUsersQueueData(log, function(queueData) {
        var user = queueData.user;

        var task;
        if(self.isMention) {
          task = new TwitterMentionTask(user.augeoUser, user, queueData.mentionId, logData);
        } else {
          task = new TwitterTweetTask(user.augeoUser, user, queueData.tweetId, logData);
        }

        self.addTask(task, logData)
      });
    },

    addTask: function(task, logData) {
      log.functionCall(this.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName':(task)?task.screenName:'invalid'});

      var self = this;
      this.isAddRequestValid(task, function(isAddRequestValid) {
        if(isAddRequestValid) {
          self.queue.push(task, function() {});
        } else {
          log.functionCall(self.QUEUE, 'addTask', logData.parentProcess, logData.username, {'task.screenName': (task) ? task.screenName : 'invalid'}, 'User already on queue');
        }
      });
    },

    finishTask: function(task, logData) {
      var queue = this.queue;

      if(!task.areAllTweetsRetrieved) {
        queue.unshift(task);
      } else {
        if(task.tweets.length > 0) {
          TwitterService.addTweets(task.user._id, task.screenName, task.tweets, this.isMention, logData, function() {
            UserService.updateAllRanks(logData, function(){});
          });
        }
      }
    }

  });

  module.exports = $this;
