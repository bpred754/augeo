
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
  var SessionValidator = require('../validator/session-validator');
  var TwitterInterfaceService = require('../interface-service/twitter-interface-service');
  var TwitterRestQueue = require('../queue/twitter-rest-queue');
  var TwitterService = require('../service/twitter-service');
  var TwitterStreamQueue = require('../queue/twitter-stream-queue');

  // Global variables
  var log = new Logger();
  var restQueue = new TwitterRestQueue();
  var streamQueue = new TwitterStreamQueue();

  /***************************************************************************/
  /* GET Requests                                                            */
  /***************************************************************************/

  TwitterRouter.get('/callback', function(request, response) {
    log.info('Creating Augeo user with Twitter data');

    var session = request.session;

    var rollback = function() {
      response.redirect(301, process.env.AUGEO_HOME + '/signup/error'); // Redirect to signup error page
    };

    // Get user's oauth secret token
    TwitterService.getUserSecretToken(session, function(oauthSecretToken) {

      TwitterInterfaceService.getOAuthAccessToken(request, oauthSecretToken, function(oauth_access_token, oauth_access_token_secret, screenName) {

        // Check if access token exists
        TwitterService.checkExistingAccessToken(oauth_access_token, function(accessTokenExists) {

          if(accessTokenExists === false) {

            // Initialize twitterMessenger
            var twitterMessenger = TwitterInterfaceService.createTwitterMessenger(oauth_access_token, oauth_access_token_secret);

            // Get user's Twitter information
            TwitterInterfaceService.getTwitterUser(twitterMessenger, screenName, function(userData) {

              userData.accessToken = oauth_access_token;
              userData.secretAccessToken = oauth_access_token_secret;

              if(SessionValidator.isUserDefined(request)) {

                // Update user's Twitter information
                TwitterService.updateTwitterInfo(request.session.user._id, userData, function() {

                  // Get queue data from user information
                  TwitterService.getQueueData(request.session.user._id, screenName, function(queueData) {

                    if(process.env.TEST != 'true') {

                      // Place user on tweet queue
                      restQueue.addUserToTweetQueue(queueData.tweetQueueData);

                      // Place user on mention queue
                      restQueue.addUserToMentionQueue(queueData.mentionQueueData);

                      if(process.env.ENV != 'local') {

                        // Connect to Twitter
                        TwitterService.connectToTwitter(restQueue, streamQueue, function() {});
                      }
                    }

                    // Set user's Twitter session data
                    request.session.user.twitter.screenName = screenName;

                    response.redirect(process.env.AUGEO_HOME + '/twitterHistory');
                  }, rollback);
                }, rollback); // End updateTwitterInfo
              } else {
                rollback();
              }
            }, rollback); // End getTwitterUser
          } else { // end accessTokenExists
            rollback();
          }
        }, rollback); // End checkExistingAccessToken
      }, rollback);
    }, rollback);
  });

  TwitterRouter.get('/getActivityDisplayData', function(request, response) {
    var isValid = false;

    var jsonResponse = {};
    if(SessionValidator.isUsernameDefined(request)) {
      isValid = true;
      jsonResponse.skills = AugeoUtility.SUB_SKILLS;
    }

    if(isValid == false) {
      response.sendStatus(401);
    } else {
      response.status(200).send(jsonResponse);
    }
  });

  TwitterRouter.get('/getAuthenticationData', function(request, response) {

    var session = request.session;

    var rollback = function() {
      TwitterService.removeInvalidUser(session, function(){}); // Remove user from DB
      request.session.destroy(); // Destroy the session
      response.status(401).send('Signup Failed. Please try again.');
    };

    TwitterInterfaceService.getOAuthRequestToken(function(oauthToken, oauthTokenSecret) {
      TwitterService.addUserSecretToken(request.session, oauthTokenSecret, function() {
        response.status(200).send({token:oauthToken});
      }, rollback);
    }, rollback);
  });

  TwitterRouter.get('/getCompetitors', function(request, response) {
    var username = request.query.username;
    var startRank = request.query.startRank;
    var endRank = request.query.endRank;
    var skill = request.query.skill;

    var rollback = function() {
      response.sendStatus(404);
    };

    if(username) {
      TwitterService.getCompetitors(username, skill, function(users) {
        response.status(200).json(users);
      }, rollback);
    } else {
      TwitterService.getCompetitorsWithRank(startRank, endRank, skill, function(users) {
        response.status(200).json(users);
      }, rollback)
    }
  });

  TwitterRouter.get('/getDashboardDisplayData', function(request, response) {
    var inUsername = request.query.username;

    var rollback = function() {
      response.sendStatus(401);
    };

    var targetUsername;
    var username;
    if(inUsername) {
      targetUsername = inUsername
    }
    if (SessionValidator.isUsernameDefined(request)) { // If user exists in session get dashboard data
      username = request.session.user.username;

      TwitterService.getDashboardDisplayData(username, targetUsername, function(displayData) {

        if(displayData.errorImageUrl) {
          response.status(401).json(displayData);
        } else {
          response.status(200).json(displayData)
        }
      }, rollback);
    } else { // If the user doesn't exist in session respond with "Unauthorized" HTTP code
      rollback();
    }
  });

  TwitterRouter.get('/getLeaderboardDisplayData', function(request, response) {
    var isValid = false;

    // If user exists in session get leaderboard display data
    var jsonResponse = {};
    if(SessionValidator.isUsernameDefined(request)) {
      isValid = true;

      TwitterService.getNumberUsers(function(numUsers) {

        jsonResponse.skills = AugeoUtility.SUB_SKILLS;
        jsonResponse.numberUsers = numUsers;
        response.status(200).json(jsonResponse);
      });
    }

    if(!isValid) {
      response.sendStatus(401);
    }
  });

  TwitterRouter.get('/getSkillActivity', function(request, response) {
    var username = request.query.username;
    var skill = request.query.skill;
    var tweetId = request.query.tweetId;

    var rollback = function() {
      response.sendStatus(404);
    };

    TwitterService.getSkillActivity(username, skill, tweetId, function(newData) {
      response.status(200).json(newData);
    }, rollback);
  });

  TwitterRouter.get('/getTwitterHistoryPageData', function(request, response) {

    var rollback = function() {
      response.sendStatus(401);
    };

    // If user exists in session get profile data
    if(SessionValidator.isUserDefined(request)) {
      var userId = request.session.user._id;

      var pageData = {
        mentionWaitTime: '',
        tweetWaitTime: ''
      };

      if(request.session.user.twitter.screenName) {
        pageData.mentionWaitTime = restQueue.getUsersMentionWaitTime(userId);
        pageData.tweetWaitTime = restQueue.getUsersTweetWaitTime(userId);
      } else {
        pageData.mentionWaitTime = restQueue.getMentionsWaitTime();
        pageData.tweetWaitTime = restQueue.getTweetsWaitTime();
      }

      response.status(200).json(pageData);
    } else { // If the user doesn't exist in session respond with "Unauthorized" HTTP code
      rollback();
    }
  });

  module.exports = TwitterRouter;
