
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
  /* Description: Object to manage Twitter tweet queue tasks                 */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../../../public/javascript/common/abstract-object');
  var TwitterQueueTask = require('./twitter-event-task');
  var TwitterInterfaceService = require('../../../interface-service/twitter-interface-service');
  var Logger = require('../../../module/logger');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'twitter-tweet-task';

  // Access with $this.variable inside of class and class.variable outside
  function publicStaticVariables($this)
  {
    var maxRequests = 16;
    var window = 15;
    var requestsPerWindow = process.env.TEST === 'true' ? 3600 : 300;

    $this.TWEET_TIMEOUT = ((window*60)/requestsPerWindow)*1000;
    $this.MAX_EXECUTION_TIME = (window / requestsPerWindow) * maxRequests * 60;
  }

  // Constructor
  var $this = function(user, twitterData, lastEventId, logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username, {'userId': (user)?user._id:'invalid',
      'screenName': (twitterData)?twitterData.screenName:'invalid', 'lastEventId': lastEventId});

    // Call parent constructor
    $this.base.constructor.call(this, user, twitterData, lastEventId, logData);

    // public variables
    this.lastEventId = lastEventId;
    this.twitterMessenger = TwitterInterfaceService.createTwitterMessenger(twitterData.accessToken, twitterData.secretAccessToken, logData);
    this.wait = $this.TWEET_TIMEOUT;
  };

  publicStaticVariables($this);

  AbstractObject.extend(TwitterQueueTask, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      var task = this;
      TwitterInterfaceService.getTweets(this.twitterMessenger, logData, function(error, tweets) {
        task.processResult(error, tweets, logData, function(updatedTask) {
          callback(updatedTask);
        });
      }, task.nextTweetId);
    }
  });

  module.exports = $this;
