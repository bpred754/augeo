
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
  /* Description: Object to manage Github event queue tasks                  */
  /***************************************************************************/

    // Required local modules
  var AbstractObject = require('../../public/javascript/common/abstract-object');
  var AbstractQueueTask = require('../abstract-queue-task');
  var GithubInterfaceService = require('../../interface-service/github-interface-service');
  var Logger = require('../../module/logger');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'github-queue-task';

  // Access with $this.variable inside of class and class.variable outside
  function publicStaticVariables($this)
  {
    var maxRequests = 10;
    var window = 60;
    var requestsPerWindow = 5000;

    $this.MAX_EXECUTION_TIME = (window / requestsPerWindow) * maxRequests * 60;
  }

  // Constructor
  var $this = function(user, githubData, lastEventId, logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username, {'userId': (user)?user._id:'invalid',
      'screenName': (githubData)?githubData.screenName:'invalid', 'lastEventId': lastEventId});

    // Call parent constructor
    $this.base.constructor.call(this, user);

    // public variables
    this.accessToken = githubData.accessToken;
    this.commits = new Array();
    this.eTag = null;
    this.isPoll = false; // Required field for revolving queues
    this.lastEventId = lastEventId;
    this.path = '/users/' + githubData.screenName + '/events';
    this.poll = 60000;
    this.screenName = githubData.screenName;
  };

  publicStaticVariables($this);

  AbstractObject.extend(AbstractQueueTask, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      var task = this;
      GithubInterfaceService.getCommits(this.user, this.accessToken, this.path, this.eTag, this.lastEventId, logData, function(result) {

        task.commits = task.commits.concat(result.commits);

        // If it's the first request..
        if(task.path.indexOf('?page=') < 0) {
          // Only set eTag if it is the initial task request
          task.eTag = result.eTag;

          // Set lastEventId to null, it will be updated when all new commits are retrieved
          if(task.commits.length > 0) {
            task.isPoll = false;
            task.lastEventId = null;
          }
        }

        task.path = result.path;

        // Last request
        if(!task.path) {

          // Capture lastEventId
          if(task.commits.length > 0) {
            task.lastEventId = task.commits[0].eventId;
          }

          task.isPoll = true;
        }

        task.poll = result.poll;
        task.wait = result.wait;

        callback(task);
      });
    },

    reset: function(logData) {
      log.functionCall(TASK, 'reset', logData.parentProcess, logData.username, {'screenName':this.screenName});

      this.commits.length = 0;
      this.path = '/users/' + this.screenName + '/events';
      this.wait = 0;
    }
  });

  module.exports = $this;

