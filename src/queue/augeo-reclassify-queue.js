
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
  /* Description: Queue to handle staged flags                               */
  /***************************************************************************/


  // Required local modules
  var AbstractObject = require('../public/javascript/common/abstract-object');
  var AugeoDB = require('../model/database');
  var AugeoUtility = require('../utility/augeo-utility');
  var BaseQueue = require('./base-queue');
  var Logger = require('../module/logger');
  var UserService = require('../service/user-service');

  // Global variables
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');
  var log = new Logger();

  var $this = function(logData) {
    var queueType = 'reclassify-queue';
    log.functionCall(queueType, 'init', logData.parentProcess, logData.username);

    // Call base-queue constructor
    $this.base.constructor.call(this, logData);

    // Constants
    this.QUEUE = queueType;

    // Public variables
    this.isRevolvingQueue = true;
  };

  AbstractObject.extend(BaseQueue, $this, {

    addTask: function(task, logData) {
      log.functionCall(this.QUEUE, 'addTask', logData.parentProcess, logData.username);

      // Make sure there are no tasks in the queue
      if(this.queue.tasks.length == 0 && !this.isBusy) {
        this.queue.push(task, function(){});
      } else {
        log.functionError(this.queue, 'addTask', logData.parentProcess, logData.username, 'Reclassify queue already has a revolving task');
      }
    },

    finishTask: function(task, logData, callback) {
      var self = this;

      // Remove all entries from AUGEO_STAGED_FLAG with the tasks execution date
      StagedFlag.removeStagedFlags(task.executeDate, logData, function() {
        UserService.updateAllRanks(logData, function () {
          self.queue.push(task, logData);
          callback();
        });
      });
    },

    prepareTask: function(task, logData) {

      // Calculate the time it takes to get to midnight +1 minute
      var nowDate = Date.now();
      task.executeDate = AugeoUtility.calculateReclassifyDate(nowDate, 24, logData);

      var oneMinute = 1000 * 60;
      this.taskWaitTime = (task.executeDate.getTime() + oneMinute) - nowDate;
    }

  });

  module.exports = $this;
