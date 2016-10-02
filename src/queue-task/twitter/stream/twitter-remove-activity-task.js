
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
  /* Description: Object to manage Twitter remove activity queue tasks       */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../../../public/javascript/common/abstract-object');
  var Logger = require('../../../module/logger');
  var TwitterService = require('../../../service/twitter-service');
  var UserService = require('../../../service/user-service');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'twitter-remove-activity-task';

  // Constructor
  var $this = function(tweetId, logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username);

    // Call parent constructor
    $this.base.constructor.call(this);

    // public variables
    this.tweetId = tweetId;
    this.wait = 0;
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      TwitterService.removeTweet(this.tweetId, logData, function() {
        UserService.updateAllRanks(logData, function() {
          callback();
        })
      });
    }
  });

  module.exports = $this;