
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
  /* Description: Handles all interfaces with the Twitter API                */
  /***************************************************************************/

  // Required libraries
  var Twit = require('twit');

  // Required local modules
  var Logger = require('../module/logger');
  var OAuth= require('oauth').OAuth;

  // Constants
  var CALLBACK_URL = process.env.AUGEO_HOME + '/twitter-api/callback'
  var CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
  var CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
  var APP_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
  var APP_SECRET_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  // Global variables
  var appMessenger = new Twit({
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    access_token: APP_ACCESS_TOKEN,
    access_token_secret: APP_SECRET_ACCESS_TOKEN
  });
  var isStreamConnected = false;
  var log = new Logger();
  var oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    CONSUMER_KEY,
    CONSUMER_SECRET,
    "1.0",
    CALLBACK_URL,
    "HMAC-SHA1"
  );
  var stream;

  /***************************************************************************/
  /* Constructors                                                            */
  /***************************************************************************/

  exports.createTwitterMessenger = function(accessToken, secretAccessToken) {
    log.info('Creating TwitterMessenger');
    var messenger = new Twit({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
      access_token: accessToken,
      access_token_secret: secretAccessToken
    });

    return messenger;
  };

  /***************************************************************************/
  /* Twitter Calls                                                           */
  /***************************************************************************/

  // Call to Twitter API to get user's mentions
  exports.getMentions = function(messenger, callback, maxId) {
    log.info('Making API call to Twitter for user Mentions');

    if(maxId) {
      messenger.get('/statuses/mentions_timeline', {trim_user:false, contributor_details:true, include_entities:true, max_id:maxId}, callback);
    } else {
      messenger.get('/statuses/mentions_timeline', {trim_user:false, contributor_details:true, include_entities:true}, callback);
    }
  };

  // Get Oauth access token
  exports.getOAuthAccessToken = function(data, oauthSecretToken, callback) {

    oauth.getOAuthAccessToken(
      data.oauth_token,
      oauthSecretToken,
      data.oauth_verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          log.error('Failed to get OAuth Access Token');
          log.error(error);
          callback(error)
        }
        else {
          callback(oauth_access_token, oauth_access_token_secret, results.screen_name);
        }
      }
    );
  };

  // Get Oauth request token
  exports.getOAuthRequestToken = function(callback) {
    oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret) {
      if (error) {
        log.error(error);
        callback(error)
      }
      callback(oauth_token, oauth_token_secret);
    });
  };

  // Call to Twitter API to get user's Tweets
  exports.getTweets = function(messenger, callback, maxId) {
    log.info('Making API call to Twitter for user Tweets');

    if(maxId) {
      messenger.get('/statuses/user_timeline',{include_entities:true, trim_user:false, max_id:maxId}, callback);
    } else {
      messenger.get('/statuses/user_timeline',{include_entities:true, trim_user:false}, callback);
    }
  };

  // Call to Twitter API to get user's Twitter information
  exports.getTwitterData = function(messenger, screenName, callback) {
    log.info('Making API call to Twitter for ' + screenName + ' Twitter data');
    messenger.get('/users/show', {screen_name: screenName}, callback);
  };

  // Opens a stream with the Twitter public API
  exports.openStream = function(twitterIds, addCallback, removeCallback, connectedCallback) {

    if(isStreamConnected === true) {
      log.error('Disconnecting from Twitter Stream');
      stream.stop();
      isStreamConnected = false;
    }

    stream = appMessenger.stream('statuses/filter', {follow: twitterIds});

    stream.on('tweet', function(tweet) {
      log.info('Received Tweet from user with twitterID: ' + tweet.user.id_str);
      addCallback(tweet);
    });

    stream.on('delete', function(deleteMessage) {
      log.info('Deleting tweet for user with twitterID: ' + tweet.user.id_str);
      // TODO: Complete remove logic
      // removeCallback(deleteMessage);
    });

    stream.on('limit', function(limitMessage) {
      log.warn('Twitter rate limit. Message: ' + limitMessage);
    });

    stream.on('connect', function(request) {
      log.info('Stream request sent to Twitter');
    });

    stream.on('connected', function(response) {
      log.info('Connected to Twitter Stream');
      isStreamConnected = true;
      connectedCallback();
    });

    stream.on('reconnect', function(request, response, connectInterval) {
      log.info('Disconnected from Twitter - reconnecting in ' + connectInterval);
    });
  };
