
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
  /* Description: Handles logic related to interfacing with Github           */
  /***************************************************************************/

  var githubInterfaceUrl = process.env.TEST === 'true' ? '../../test/test-interface/github-test-interface' : '../interface/github-interface';

  // Required local modules
  var Commit = require('../module/common/commit');
  var GithubInterface = require(githubInterfaceUrl);
  var Logger = require('../module/logger');

  // Constants
  var SERVICE = 'github_interface-service';

  // Global variables
  var log = new Logger();

  exports.getAccessToken = function(code, logData, callback) {
    log.functionCall(SERVICE, 'getAccessToken', logData.parentProcess, logData.username, {'code':(code)?'valid':'invalid'});

    GithubInterface.getAccessToken(code, logData, function(data) {

      var accessToken = '';
      if(data) {
        accessToken = JSON.parse(data).access_token;
      }

      callback(accessToken);
    });
  };

  exports.getCommits = function(userId, accessToken, path, eTag, lastEventId, logData, callback) {
    log.functionCall(SERVICE, 'getCommits', logData.parentProcess, logData.username, {'userId':userId, 'accessToken':(accessToken)?'valid':'invalid', 'path': path,
      'eTag':eTag, 'lastEventId':lastEventId});

    GithubInterface.getPushEvents(accessToken, path, eTag, logData, function(data, headers) {
      var status = headers['status'];

      var commits = new Array();
      var result = {
        commits: commits,
        eTag: headers['etag'],
        poll: (headers['x-poll-interval'])?headers['x-poll-interval']*1000:60000,
        wait: calculateNextRequestWaitTime(headers)
      };

      if(status.indexOf('200') > -1) { // If there are results..

        result.path = extractNextRequestPath(headers['link']);

        var events = JSON.parse(data);
        for (var i = 0; i < events.length; i++) {

          // Add commits until last eventId is found
          if(!lastEventId || parseInt(events[i].id) > parseInt(lastEventId)) {
            commits = commits.concat(extractPushCommits(userId, events[i]));
          } else {
            // Set path to null if last eventId is found
            result.path = null;
            break;
          }
        }

        result.commits = commits;
      } else { // No changes
        log.functionCall(SERVICE, 'getCommits', logData.parentProcess, logData.username, {}, '304 - Not Modified');
      }

      callback(result);
    });
  };

  exports.getUserData = function(accessToken, logData, callback) {
    log.functionCall(SERVICE, 'getUserData', logData.parentProcess, logData.username, {'accessToken': (accessToken)?'valid':'invalid'});

    GithubInterface.getUserData(accessToken, logData, function(userData) {

      var user = {};
      if(userData) {
        var json = JSON.parse(userData);
        user = {
          accessToken:accessToken,
          githubId: json.id,
          name: json.name,
          profileImageUrl: json.avatar_url,
          screenName: json.login
        };
      }
      callback(user);
    });
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var calculateNextRequestWaitTime = function(headers) {

    var wait = 1000;
    var resetTime = headers['x-ratelimit-reset']*1000;
    var currentTime = (new Date).getTime();
    var remainingTime = resetTime - currentTime;

    var remainingRequests = headers['x-ratelimit-remaining'];
    if(remainingTime >= 0) {
      wait = (remainingTime/remainingRequests) + 100;
    }

    return wait;
  };

  var extractNextRequestPath = function(linkHeader) {
    var path = null;
    var links = linkHeader.split(',');
    for(var i = 0; i < links.length; i++) {
      if(links[i].indexOf('rel="next"') > -1) {
        path = links[i].substring(links[i].indexOf('.com') + 4, links[i].indexOf('>'))
      }
    }
    return path;
  };

  var extractPushCommits = function(userId, event) {

    var commits = new Array;
    var commitJson = {
      classification: 'Technology',
      classificationGlyphicon: 'glyphicon-phone',
      experience: 100,
      kind: 'GITHUB_COMMIT',
      user: userId
    };
    if(event.type == 'PushEvent' && event.public == true) {

      commitJson.timestamp = event.created_at;
      commitJson.eventId = event.id;

      if(event.actor) {
        var actor = event.actor;
        commitJson.avatarImageSrc = actor.avatar_url;
        commitJson.githubId = actor.id;
        commitJson.screenName = actor.display_login;
      }

      if(event.repo) {
        commitJson.repo = event.repo.name.substring(commitJson.screenName.length+1);
      }

      if(event.payload) {
        if(event.payload.commits) {
          var rawCommits = event.payload.commits;
          for(var j = 0; j < rawCommits.length; j++) {
            var rawCommit = rawCommits[j];
            if (rawCommit.author) {
              commitJson.name = rawCommit.author.name
            }
            commitJson.text = rawCommit.message;
            commitJson.sha = rawCommit.sha;

            commits.push(new Commit(commitJson));
          }
        }
      }
    }
    return commits;
  };
