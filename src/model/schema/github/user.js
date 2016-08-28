
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
  /* Description: Logic for GITHUB_USEr database collection                  */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'github_user-collection';

  // Global variables
  var AugeoUser = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  // Schema declaration
  var GITHUB_USER = Mongoose.Schema({
    accessToken: String,
    augeoUser: {type: Mongoose.Schema.Types.ObjectId, ref:'AUGEO_USER'}, // Foreign key
    githubId: String,
    name: String,
    profileImageUrl: String,
    screenName: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  GITHUB_USER.statics.add = function(username, user, logData, callback) {

    this.create(user, function(error0, githubUser) {
      if(error0) {
        log.functionError(COLLECTION, 'add', logData.parentProcess, logData.username,
          'Failed to save GITHUB_USER for user with GithubId: ' + (user)?user.githubId:'invalid' + ' Error: ' + error0);
        callback();
      } else {
        log.functionCall(COLLECTION, 'add', logData.parentProcess, logData.username, {'user.githubId':(user)?user.githubId:'invalid'}, 'Saved GITHUB_USER');

        // Add reference to AugeoUser
        AugeoUser.getUserWithUsername(username, logData, function(augeoUser) {

          augeoUser.github = githubUser._id;
          augeoUser.save(function(error1) {
            if(error1) {
              log.functionError(COLLECTION, 'add', logData.parentProcess, logData.username, 'Failed to save AUGEO_USER for username: ' + username + '. Error: ' + error1);
            } else {
              log.functionCall(COLLECTION, 'add', logData.parentProcess, logData.username, {'username': username});
            }
            callback(augeoUser);
          });
        });
      }
    });
  };

  GITHUB_USER.statics.getAllUsers = function(logData, callback) {
    this.find({}, function(error, users) {
      if(error) {
        log.functionError(COLLECTION, 'getAllUsers', logData.parentProcess, logData.username, 'Failed to get Github users:' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getAllUsers', logData.parentProcess, logData.username);
        callback(users);
      }
    });
  };

  GITHUB_USER.statics.getUserWithScreenName = function(screenName, logData, callback) {
    this.findOne({'screenName':screenName})
      .exec(function(error, githubUser) {
        if(error) {
          log.functionError(COLLECTION, 'getUserWithScreenName', logData.parentProcess, logData.username,
            'Failed to retrieve Github user with screen name: ' + screenName + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getUserWithScreenName', logData.parentProcess, logData.username);
        }
        callback(githubUser);
      });
  };

  GITHUB_USER.statics.remove = function(augeoId, logData, callback) {
    this.findOneAndRemove({augeoUser:augeoId})
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'remove', logData.parentProcess, logData.username, 'Failed to remove Github user with augeoId: ' + augeoId + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'remove', logData.parentProcess, logData.username, {'augeoId':augeoId});
        }
        callback(user);
      });
  };

  // Declare model
  module.exports = AugeoDB.model('GITHUB_USER', GITHUB_USER);
