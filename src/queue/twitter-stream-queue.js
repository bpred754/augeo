
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

  // Constants
  var CHECK_QUEUE_OPEN_TIMEOUT = 500;
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
      log.info('Executing streamQueue task for tweetID: ' + queueData.data.id_str);

      var action = queueData.action;
      var data = queueData.data;

      if(action == 'Add') {
        var checkClassification = true;
        var tweet = TwitterInterfaceService.extractTweet(data, checkClassification);
        var mention = TwitterInterfaceService.extractReply(data);
        var action = TwitterInterfaceService.extractAction(data);

        TwitterService.addAction(action, tweet, mention, callback);
      } else if(action == 'Remove') { // Remove logic
        TwitterService.removeTweet(data.status, callback);
      } else if(action == 'Open') {

        onStreamRequestOpen(function() {
          startStreamTimer();
          TwitterInterfaceService.openStream(data, queueData.callback, queueData.removeCallback, queueData.connectedCallback);
          callback();
        });
      }

    }, 1); // Only allow 1 request at a time
  };

  TwitterStreamQueue.prototype.addAction = function(queueData, callback) {
    log.info('Adding action to streamQueue: ' + queueData.data.id_str + '. Action: ' + queueData.action);
    streamQueue.push(queueData, function(skill) {
      TwitterService.updateTwitterRanks(function() {
        TwitterService.updateSubSkillRanks(skill, function() {
          log.info('Finished updating ranks.');
          callback();
        });
      });
    });
  };

  TwitterStreamQueue.prototype.openStream = function(queueData, callback) {
    log.info('Opening stream connection with Twitter');
    streamQueue.push(queueData, function() {
      callback();
    });
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var onStreamRequestOpen = function(callback) {
    if(self.streamRequestOpen == true) {
      callback();
    } else {
      setTimeout(function() {onStreamRequestOpen(callback)}, CHECK_QUEUE_OPEN_TIMEOUT);
    }
  };

  var startStreamTimer = function() {
    self.streamRequestOpen = false;
    setTimeout(function() {
      self.streamRequestOpen = true;
    }, STREAM_TIMEOUT);
  };

  module.exports = TwitterStreamQueue;
