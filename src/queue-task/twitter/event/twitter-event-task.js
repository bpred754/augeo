
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
  var AbstractObject = require('../../../public/javascript/common/abstract-object');
  var AbstractQueueTask = require('../../abstract-queue-task');
  var AugeoUtility = require('../../../utility/augeo-utility');
  var Logger = require('../../../module/logger');
  var TwitterInterfaceService = require('../../../interface-service/twitter-interface-service');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'twitter-queue-task';

  // Constructor
  var $this = function(user, twitterData, lastEventId, logData) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username, {'userId': (user)?user._id:'invalid',
      'screenName': (twitterData)?twitterData.screenName:'invalid', 'lastEventId': lastEventId});

    // Call parent constructor
    $this.base.constructor.call(this, user);

    // public variables
    this.areAllTweetsRetrieved = false;
    this.lastEventId = lastEventId;
    this.nextTweetId;
    this.screenName = twitterData.screenName;
    this.tweets = new Array();
    this.twitterMessenger = TwitterInterfaceService.createTwitterMessenger(twitterData.accessToken, twitterData.secretAccessToken, logData);
  };

  AbstractObject.extend(AbstractQueueTask, $this, {

    processResult: function(error, retrievedTweets, logData, callback) {
      log.functionCall(TASK, 'processResult', logData.parentProcess, logData.username);

      if(!error && retrievedTweets.length > 0) {

        // nextTweetId will be used to retrieve the next set of tweets
        var nextTweetId = retrievedTweets[retrievedTweets.length - 1].tweetId;

        // Remove first element from tweets if a tweet id was passed in
        if (this.nextTweetId) {
          retrievedTweets = AugeoUtility.trimArray(retrievedTweets, logData);
        }

        // Check if tweets contain lastEventId
        var tweetsToAdd = new Array();
        for(var i = 0; i < retrievedTweets.length; i++) {
          if(!this.lastEventId || parseInt(retrievedTweets[i].tweetId) > parseInt(this.lastEventId)) {
            tweetsToAdd.push(retrievedTweets[i]);
          }
        }

        // Determine if there are more tweets to retrieve
        if (this.nextTweetId == nextTweetId || tweetsToAdd.length == 0) {
          this.areAllTweetsRetrieved = true;
        }

        this.nextTweetId = nextTweetId;
        this.tweets = this.tweets.concat(tweetsToAdd);
      } else {
        this.areAllTweetsRetrieved = true;
      }

      callback(this);
    },

    reset: function(logData) {}
  });

  module.exports = $this;
