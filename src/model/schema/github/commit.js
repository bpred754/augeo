
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
  /* Description: Logic for COMMIT database collection                       */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'commit-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var GITHUB_COMMIT = Mongoose.Schema({
    avatarImageSrc: String,
    eventId: String,
    githubId: String,
    name: String,
    repo: String,
    screenName: String,
    sha: String,
    text: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  GITHUB_COMMIT.statics.addCommits = function(screenName, commits, logData, callback) {
    var updatedCommits = new Array();

    var commitDocument = this;
    if(commits.length > 0) {
      // Asynchronous method calls in loop - Using Recursion
      (function myClojure(i) {
        var commit = commits[i];
        commitDocument.findOneAndUpdate({screenName: screenName, repo:commit.repo, sha: commit.sha}, commit, {upsert:true, 'new':true}, function(error, updatedCommit) {
          if (error) {
            log.functionError(COLLECTION, 'addCommits', logData.parentProcess, logData.username,
              'Failed to upsert commit with repo/sha: ' + (commit)?commit.repo:'invalid' + '/' + (commit)?commit.sha:'invalid' + '. Error: ' + error);
            updatedCommits.push({});
          } else {
            log.functionCall(COLLECTION, 'upsertCommits', logData.parentProcess, logData.username, {'repo':(commit)?commit.repo:'invalid' + '/' + (commit)?commit.sha:'invalid'});

            updatedCommits.push(updatedCommit);
            i++;
            if (i < commits.length) {
              myClojure(i);
            } else {
              callback(updatedCommits);
            }
          }
        });
      })(0); // Pass i as 0 and myArray to myClojure
    } else {
      callback(updatedCommits);
    }
  };

  GITHUB_COMMIT.statics.getCommitCount = function(logData, callback) {
    this.count({}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'getCommitCount', logData.parentProcess, logData.username, 'Failed to retrieve commit count: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getCommitCount', logData.parentProcess, logData.username);
        callback(count);
      }
    });
  };

  GITHUB_COMMIT.statics.getLatestCommit = function(screenName, logData, callback) {
    this.find({screenName:screenName},{},{sort:{'eventId':-1},limit:1}).exec(function(error, data) {
      if(error) {
        log.functionError(COLLECTION, 'getLatestCommit', logData.parentProcess, logData.username, 'Failed to get latest commit ID for user with screenName:' + screenName +
          '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getLatestCommit', logData.parentProcess, logData.username, {'screenName':screenName});
        callback(data[0]);
      }
    });
  };

  // Declare Model
  module.exports = AugeoDB.model('GITHUB_COMMIT', GITHUB_COMMIT);
