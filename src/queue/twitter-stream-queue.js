
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
  var UserService = require('../service/user-service');

  // Global variables
  var log = new Logger();

  var $this = function(logData) {
    var queueType = 'twitter-stream-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addTask: function(task, logData) {
      log.functionCall(this.QUEUE, 'addTask', logData.parentProcess, logData.username);

      this.queue.push(task, function(){});
    },

    finishTask: function(classification, logData, callback) {
      var self = this;
      UserService.updateRanks(logData, function() {
        if(classification) {
          UserService.updateSubSkillRanks(classification, logData, function () {
            log.functionCall(self.QUEUE, 'finishTask', logData.parentProcess, logData.username, {}, 'Finished updating ranks');
            callback();
          });
        } else {
          callback();
        }
      });
    },

    prepareTask: function() {
      this.taskWaitTime = 0;
    }

  });

  module.exports = $this;