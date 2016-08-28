
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
  /* Description: TwitterInterface mock so requests are not made to Twitter  */
  /*              during unit text execution                                 */
  /***************************************************************************/

  // Required local modules
  var Data = require('../data/twitter-stream-data');
  var Stream = require('../stream/twitter-test-stream');

  // Global variables
  var connectIterations = 0;

  /***************************************************************************/
  /* Constructors                                                            */
  /***************************************************************************/

  exports.createTwitterMessenger = function(accessToken, secretAccessToken) {
    var messenger = {};
    return messenger;
  };

  /***************************************************************************/
  /* Twitter Calls                                                           */
  /***************************************************************************/

  // Call to test database to get user's mentions
  exports.getMentions = function(messenger, logData, callback, maxId) {
      callback(false, Data.getRawMentions(maxId), {});
  };

  exports.getNumberConnections = function() {
    return connectIterations;
  };

  // Generate test Oauth access token
  exports.getOAuthAccessToken = function(data, oauthSecretToken, logData, callback) {

    if(data.oauth_token && oauthSecretToken && data.oauth_verifier) {
      var accessToken = generateAccessToken();
      var secretAccessToken = generateAccessToken();
      var screenName = 'testScreenName';
      callback(accessToken, secretAccessToken, screenName);
    } else {
      var error = {
        message: 'Invalid input'
      }
      callback(error);
    }
  };

  // Generate test Oauth request token
  exports.getOAuthRequestToken = function(logData, callback) {
    callback(generateRequestToken(), generateRequestToken());
  };

  // Call to test database to get user's Tweets
  exports.getTweets = function(messenger, logData, callback, maxId) {
    callback(false, Data.getRawTweets(maxId), {});
  };

  // Call to test database to get user's Twitter information
  exports.getTwitterData = function(messenger, screenName, logData, callback) {
    callback(false, Data.getRawUser(screenName), {});
  };

  // Listens for events from test-api
  exports.openStream = function(twitterIds, logData, callback, removeCallback) {

    connectIterations++;

    Stream.onTweet(function(tweet) {
      callback(tweet);
    });

    Stream.onMention(function(mention) {
      callback(mention)
    });

    Stream.onDelete(function(deleteMessage) {
      removeCallback(deleteMessage);
    })
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var generateRequestToken = function()
  {
    var token = '';
    for( var i=0; i < 32; i++ )
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
  }

  var generateAccessToken = function()
  {
    var token = '';
    for( var i=0; i < 50; i++ )
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
  }
