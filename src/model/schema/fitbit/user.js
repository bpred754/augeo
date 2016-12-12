
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
  /* Description: Logic for FITBIT_USER database collection                  */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'fitbit-user-collection';

  // Global variables
  var AugeoUser = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  // Schema declaration
  var FITBIT_USER = Mongoose.Schema({
    accessToken: String,
    augeoUser: {type: Mongoose.Schema.Types.ObjectId, ref:'AUGEO_USER'}, // Foreign key
    fitbitId: String,
    name: String,
    profileImageUrl: String,
    refreshToken: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  FITBIT_USER.statics.add = function(username, user, logData, callback) {

    this.create(user, function(error0, fitbitUser) {
      if(error0) {
        log.functionError(COLLECTION, 'add', logData.parentProcess, logData.username,
          'Failed to save FITBIT_USER for user with fitbitId: ' + (user)?user.fitbitId:'invalid' + ' Error: ' + error0);
        callback();
      } else {
        log.functionCall(COLLECTION, 'add', logData.parentProcess, logData.username, {'user.fitbitId':(user)?user.fitbitId:'invalid'}, 'Saved FITBIT_USER');

        // Add reference to AugeoUser
        AugeoUser.getUserWithUsername(username, logData, function(augeoUser) {

          augeoUser.fitbit = fitbitUser._id;
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

  FITBIT_USER.statics.getAllUsers = function(logData, callback) {
    this.find({}).populate('augeoUser').exec(function(error, users) {
      if(error) {
        log.functionError(COLLECTION, 'getAllUsers', logData.parentProcess, logData.username, 'Failed to get Fitbit users:' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getAllUsers', logData.parentProcess, logData.username);
        callback(users);
      }
    });
  };

  FITBIT_USER.statics.getUserWithFitbitId= function(fitbitId, logData, callback) {
    this.findOne({'fitbitId':fitbitId})
      .exec(function(error, fitbitUser) {
        if(error) {
          log.functionError(COLLECTION, 'getUserWithFitbitId', logData.parentProcess, logData.username,
            'Failed to retrieve Fitbit user with fitbitId: ' + fitbitId + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getUserWithFitbitId', logData.parentProcess, logData.username);
        }
        callback(fitbitUser);
      });
  };

  FITBIT_USER.statics.remove = function(augeoId, logData, callback) {
    this.findOneAndRemove({augeoUser:augeoId})
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'remove', logData.parentProcess, logData.username, 'Failed to remove Fitbit user with augeoId: ' + augeoId + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'remove', logData.parentProcess, logData.username, {'augeoId':augeoId});
        }
        callback(user);
      });
  };

  FITBIT_USER.statics.updateAccessTokens = function(fitbitId, tokens, logData, callback) {

    var update = {
      $set:{
        'accessToken': tokens.access_token,
        'refreshToken': tokens.refresh_token
      }
    };

    this.findOneAndUpdate({'fitbitId': fitbitId}, update, {new:true}, function(error, updatedUser) {

      var returnUser;
      if(error) {
        log.functionError(COLLECTION, 'updateAccessTokens', logData.parentProcess, logData.username, 'Failed to update users access tokens. Error: '+ error);
      } else {
        log.functionCall(COLLECTION, 'updateAccessTokens', logData.parentProcess, logData.username, {'tokens':(tokens.access_token && tokens.refresh_token)?'valid':'invalid'});
        returnUser = updatedUser;
      }

      callback(returnUser);
    });
  };

  // Declare model
  module.exports = AugeoDB.model('FITBIT_USER', FITBIT_USER);
