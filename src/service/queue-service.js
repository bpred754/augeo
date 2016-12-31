
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
  /* Description: Singleton to manage app queues                             */
  /***************************************************************************/

  var AugeoReclassifyQueue = require('../queue/augeo-reclassify-queue');
  var AugeoReclassifyTask = require('../queue-task/augeo/reclassify-task');
  var FitbitEventQueue = require('../queue/fitbit-event-queue');
  var GithubEventQueue = require('../queue/github-event-queue');
  var TwitterConnectQueue = require('../queue/twitter-connect-queue');
  var TwitterEventQueue = require('../queue/twitter-event-queue');
  var TwitterStreamQueue = require('../queue/twitter-stream-queue');

  exports.augeoReclassifyQueue = null;
  exports.fitbitEventQueue = null;
  exports.githubEventQueue = null;
  exports.twitterConnectQueue = null;
  exports.twitterEventQueue = null;
  exports.twitterStreamQueue = null;

  exports.initializeAppQueues = function(logData) {

    // Augeo Queues
    exports.augeoReclassifyQueue = new AugeoReclassifyQueue(logData);
    var reclassifyTask = new AugeoReclassifyTask(logData);
    exports.augeoReclassifyQueue.addTask(reclassifyTask, logData);

    // Fitbit Queues
    exports.fitbitEventQueue = new FitbitEventQueue(logData);
    exports.fitbitEventQueue.addAllUsers(logData, function(){});

    // Github Queues
    exports.githubEventQueue = new GithubEventQueue(logData);
    exports.githubEventQueue.addAllUsers(logData, function(){});

    // Twitter Queues
    exports.mentionEventQueue = new TwitterEventQueue(logData, true);
    exports.tweetEventQueue = new TwitterEventQueue(logData);
    exports.twitterStreamQueue = new TwitterStreamQueue(logData);
    exports.twitterConnectQueue = new TwitterConnectQueue(exports.tweetEventQueue, exports.mentionEventQueue, exports.twitterStreamQueue, logData);
    exports.twitterConnectQueue.connectToTwitter(logData, function(){});
  };