
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
  /* Description: Handles requests to Augeo's twitter-api                    */
  /***************************************************************************/

  // Required libraries
  var TwitterRouter = require('express').Router();

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var Logger = require('../module/logger');
  var AugeoValidator = require('../validator/augeo-validator');
  var TwitterInterfaceService = require('../interface-service/twitter-interface-service');
  var TwitterRestQueue = require('../queue/twitter-rest-queue');
  var TwitterService = require('../service/twitter-service');
  var TwitterStreamQueue = require('../queue/twitter-stream-queue');
  var UserService = require('../service/user-service');

  // Constants
  var API = 'twitter-api';
  var CALLBACK = '/callback';
  var GET_AUTHENTICATION_DATA = '/getAuthenticationData';
  var GET_DASHBOARD_DISPLAY_DATA = '/getDashboardDisplayData';
  var GET_SKILL_ACTIVITY = '/getSkillActivity';
  var GET_TWITTER_HISTORY_PAGE_DATA = '/getTwitterHistoryPageData';
  var INVALID_SESSION = 'Invalid session';

  // Global variables
  var log = new Logger();
  var restQueue = new TwitterRestQueue();
  var streamQueue = new TwitterStreamQueue();

  /***************************************************************************/
  /* GET Requests                                                            */
  /***************************************************************************/

  TwitterRouter.get(CALLBACK, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(message) {
      log.functionError(API, CALLBACK, username, message);

      // TODO: Remove invalid entries from TWITTER_USER
      response.redirect(301, process.env.AUGEO_HOME + '/signup/error'); // Redirect to signup error page
    };

    if(username) {
      log.functionCall(API, CALLBACK, null, username);
      var logData = AugeoUtility.formatLogData(API+CALLBACK, username);

      var userId = request.session.user._id;

      // Get user's oauth secret token
      TwitterService.getUserSecretToken(userId, logData, function (oauthSecretToken) {

        TwitterInterfaceService.getOAuthAccessToken(request.query, oauthSecretToken, logData, function (oauth_access_token, oauth_access_token_secret, screenName) {

          // Check if access token exists
          TwitterService.checkExistingAccessToken(oauth_access_token, logData, function (accessTokenExists) {

            if (accessTokenExists === false) {

              // Initialize twitterMessenger
              var twitterMessenger = TwitterInterfaceService.createTwitterMessenger(oauth_access_token, oauth_access_token_secret, logData);

              // Get user's Twitter information
              TwitterInterfaceService.getTwitterUser(twitterMessenger, screenName, logData, function (userData) {

                userData.accessToken = oauth_access_token;
                userData.secretAccessToken = oauth_access_token_secret;

                // Update user's Twitter information
                TwitterService.updateTwitterInfo(userId, request.session.user, userData, logData, function (updatedUser) {

                  // Update session user object
                  request.session.user = updatedUser;

                  // Get queue data from user information
                  TwitterService.getQueueData(userId, screenName, logData, function (queueData) {

                    if (process.env.TEST != 'true') {

                      // Place user on tweet queue
                      restQueue.addUserToTweetQueue(queueData.tweetQueueData, logData);

                      // Place user on mention queue
                      restQueue.addUserToMentionQueue(queueData.mentionQueueData, logData);

                      if (process.env.ENV != 'local') {

                        // Connect to Twitter
                        TwitterService.connectToTwitter(restQueue, streamQueue, logData, function () {});
                      }
                    }

                    // Set user's Twitter session data
                    request.session.user.twitter = {
                      screenName: screenName
                    };

                    response.redirect(process.env.AUGEO_HOME + '/twitterHistory');
                  }, rollback);
                }, rollback); // End updateTwitterInfo

              }, rollback); // End getTwitterUser
            } else { // end accessTokenExists
              rollback();
            }
          }, rollback); // End checkExistingAccessToken
        }, rollback);
      }, rollback);
    } else {
      rollback(INVALID_SESSION);
    }
  });

  TwitterRouter.get(GET_AUTHENTICATION_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;
    var logData;

    var rollback = function(message) {
      log.functionError(API, GET_AUTHENTICATION_DATA, username, message);

      if(username) {
        logData = AugeoUtility.formatLogData(API+GET_AUTHENTICATION_DATA, username);
        UserService.removeUser(username, logData, function(){}); // Remove user from DB
        request.session.destroy(); // Destroy the session
      }
      response.status(401).send('Signup Failed. Please try again.');
    };

    if(username) {
      log.functionCall(API, GET_AUTHENTICATION_DATA, null, request.session.user.username);
      logData = AugeoUtility.formatLogData(API+GET_AUTHENTICATION_DATA, username);
      TwitterInterfaceService.getOAuthRequestToken(logData, function (oauthToken, oauthTokenSecret) {
        TwitterService.addUserSecretToken(request.session.user._id, oauthTokenSecret, logData, function () {
          response.status(200).send({token: oauthToken});
        }, rollback);
      }, rollback);
    } else {
      rollback(INVALID_SESSION);
    }
  });

  TwitterRouter.get(GET_DASHBOARD_DISPLAY_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(message) {
      log.functionError(API, GET_DASHBOARD_DISPLAY_DATA, username, message);
      response.sendStatus(401);
    };

    if (username) { // If user exists in session get dashboard data
      var target = (request.query.username) ? request.query.username: username;
      log.functionCall(API, GET_DASHBOARD_DISPLAY_DATA, null, username, {'username':target});
      var logData = AugeoUtility.formatLogData(API+GET_DASHBOARD_DISPLAY_DATA, username);

      TwitterService.getDashboardDisplayData(target, logData, function(displayData) {
        response.status(200).json(displayData);
      }, rollback);
    } else { // If the user doesn't exist in session respond with "Unauthorized" HTTP code
      rollback(INVALID_SESSION);
    }
  });

  TwitterRouter.get(GET_SKILL_ACTIVITY, function(request, response) {
    var sessionUsername = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function (code, message) {
      log.functionError(API, GET_SKILL_ACTIVITY, sessionUsername, message);
      response.sendStatus(code);
    };

    if(sessionUsername) {
      var username = request.query.username;
      var skill = request.query.skill;
      var tweetId = request.query.tweetId;

      log.functionCall(API, GET_SKILL_ACTIVITY, null, sessionUsername, {'username':username,'skill':skill,'tweetId':tweetId});
      var logData = AugeoUtility.formatLogData(API+GET_SKILL_ACTIVITY, sessionUsername);
      TwitterService.getSkillActivity(username, skill, tweetId, logData, function (newData) {
        response.status(200).json(newData);
      }, rollback);
    } else {
      rollback(401)
    }
  });

  TwitterRouter.get(GET_TWITTER_HISTORY_PAGE_DATA, function(request, response) {
    var username = AugeoValidator.isSessionValid(request) ? request.session.user.username : null;

    var rollback = function(message) {
      log.functionError(API, GET_TWITTER_HISTORY_PAGE_DATA, username, message);
      response.sendStatus(401);
    };

    // If user exists in session get profile data
    if(username) {
      log.functionCall(API, GET_TWITTER_HISTORY_PAGE_DATA, null, username);
      var logData = AugeoUtility.formatLogData(API+GET_TWITTER_HISTORY_PAGE_DATA, username);

      var userId = request.session.user._id;

      var pageData = {
        mentionWaitTime: '',
        tweetWaitTime: ''
      };

      if(request.session.user.twitter) {
        pageData.mentionWaitTime = restQueue.getUsersMentionWaitTime(userId, logData);
        pageData.tweetWaitTime = restQueue.getUsersTweetWaitTime(userId, logData);
      } else {
        pageData.mentionWaitTime = restQueue.getMentionsWaitTime(logData);
        pageData.tweetWaitTime = restQueue.getTweetsWaitTime(logData);
      }

      response.status(200).json(pageData);
    } else { // If the user doesn't exist in session respond with "Unauthorized" HTTP code
      rollback(INVALID_SESSION);
    }
  });

  module.exports = TwitterRouter;
