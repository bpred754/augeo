
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
  /* Description: Queue to handle tweets from Twitter's Streaming API        */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var BaseQueue = require('./base-queue');
  var Logger = require('../module/logger');
  var TwitterAddActivityTask = require('../queue-task/twitter/stream/twitter-add-activity-task');
  var TwitterConnectTask = require('../queue-task/twitter/stream/twitter-connect-task');
  var TwitterRemoveActivityTask = require('../queue-task/twitter/stream/twitter-remove-activity-task');
  var TwitterService = require('../service/twitter-service');

  // Global variables
  var log = new Logger();

  var $this = function(tweetQueue, mentionQueue, streamQueue, logData) {
    var queueType = 'twitter-connect-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;
    this.mentionQueue = mentionQueue;
    this.streamQueue = streamQueue;
    this.tweetQueue = tweetQueue;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addUsersToEventQueues: function(logData, callback) {
      var self = this;
      this.mentionQueue.addAllUsers(logData, function() {
        self.tweetQueue.addAllUsers(logData, function() {
          callback();
        });
      });
    },

    connectToTwitter: function(logData, callback) {
      var self = this;

      TwitterService.getUsers(logData, function (users) {
        if (users.length > 0) {
          if (process.env.ENV != 'local' || process.env.TEST == 'true') { // Only connect to Twitter's stream API if not in local environment
            var connectTask = new TwitterConnectTask(users, logData,
              function (tweetData) { // Callback function for adding activity task to stream queue
                var addActivityTask = new TwitterAddActivityTask(tweetData, logData);
                self.streamQueue.addTask(addActivityTask, logData);
              },
              function (tweetData) { // Callback function for adding remove activity task to stream queue
                var removeActivityTask = new TwitterRemoveActivityTask(tweetData, logData);
                self.streamQueue.addTask(removeActivityTask, logData);
              },
              function () { // Callback function for after the connection with Twitter has been made
                self.addUsersToEventQueues(logData, function(){});
              }
            );
            self.queue.push(connectTask);
            callback();
          } else {
            self.addUsersToEventQueues(logData, function(){});
            callback();
          }
        } else {
          callback();
        }
      });
    }

  });

  module.exports = $this;

