
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

  // Required libraries
  var Async = require('../module/queue');
  var EventEmitter = require("events").EventEmitter;
  var Util = require("util");
  Util.inherits(TwitterStreamQueue, EventEmitter);

  // Required local modules
  var Logger = require('../module/logger');
  var TwitterService = require('../service/twitter-service');
  var TwitterInterfaceService = require('../interface-service/twitter-interface-service');
  var UserService = require('../service/user-service');

  // Constants
  var CHECK_QUEUE_OPEN_TIMEOUT = 500;
  var QUEUE = 'twitter-stream-queue';
  var STREAM_REQUESTS_PER_WINDOW = process.env.TEST === 'true' ? 120 : 1;
  var STREAM_WINDOW = 2;
  var STREAM_TIMEOUT = ((STREAM_WINDOW*60)/STREAM_REQUESTS_PER_WINDOW)*1000;

  // Global variables
  var log = new Logger();
  var self;
  var streamQueue;

  // Constructor
  function TwitterStreamQueue () {

    // Stream Queue is a singleton
    if (!TwitterStreamQueue.streamQueue) {
      this.init();
      TwitterStreamQueue.streamQueue = this;
    }

    return TwitterStreamQueue.streamQueue;
  };

  TwitterStreamQueue.prototype.init = function init() {
    self = this;
    self.streamRequestOpen = true;

    streamQueue = Async.queue(function(queueData, callback) {
      var logData = queueData.logData;
      log.functionCall(QUEUE, 'Async.queue', logData.parentProcess, logData.username, {'queueData.action':(queueData)?queueData.action:'invalid'},
        'Executing mention queue task');

      var action = queueData.action;
      var data = queueData.data;

      if(action == 'Add') {
        var checkClassification = true;
        var tweet = TwitterInterfaceService.extractTweet(data, checkClassification, logData);
        var mention = TwitterInterfaceService.extractReply(data, logData);
        var action = TwitterInterfaceService.extractAction(data, logData);

        TwitterService.addAction(action, tweet, mention, logData, callback);
      } else if(action == 'Remove') { // Remove logic
        TwitterService.removeTweet(data.status, logData, callback);
      } else if(action == 'Open') {

        onStreamRequestOpen(logData, function() {
          startStreamTimer(logData);
          TwitterInterfaceService.openStream(data, logData, queueData.callback, queueData.removeCallback, queueData.connectedCallback);
          callback();
        });
      }

    }, 1); // Only allow 1 request at a time
  };

  TwitterStreamQueue.prototype.addAction = function(queueData, logData, callback) {
    log.functionCall(QUEUE, 'addAction', logData.parentProcess, logData.username, {'queueData.action':(queueData)?queueData.action:'invalid'});

    queueData.logData = logData;
    streamQueue.push(queueData, function(skill) {
      UserService.updateRanks(logData, function() {
        UserService.updateSubSkillRanks(skill, logData, function() {
          log.functionCall(QUEUE, 'addAction', logData.parentProcess, logData.username, {}, 'Finished updating ranks');
          callback();
        });
      });
    });
  };

  TwitterStreamQueue.prototype.openStream = function(queueData, callback) {
    var logData = queueData.logData;
    log.functionCall(QUEUE, 'openStream', logData.parentProcess, logData.username, {'queueData.action':(queueData)?queueData.action:'invalid'});
    streamQueue.push(queueData, function() {
      callback();
    });
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var onStreamRequestOpen = function(logData, callback) {
    log.functionCall(QUEUE, 'onStreamRequestOpen', logData.parentProcess, logData.username, {'streamRequestOpen':self.streamRequestOpen});
    if(self.streamRequestOpen == true) {
      callback();
    } else {
      setTimeout(function() {onStreamRequestOpen(logData, callback)}, CHECK_QUEUE_OPEN_TIMEOUT);
    }
  };

  var startStreamTimer = function(logData) {
    log.functionCall(QUEUE, 'startStreamTimer', logData.parentProcess, logData.username);
    self.streamRequestOpen = false;
    setTimeout(function() {
      self.streamRequestOpen = true;
    }, STREAM_TIMEOUT);
  };

  module.exports = TwitterStreamQueue;
