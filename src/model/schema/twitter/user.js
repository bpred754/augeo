
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
  /* Description: Logic for TWITTER_USER database collection                 */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'twitter_user-collection';

  // Global variables
  var AugeoUser = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  // Schema declaration
  var TWITTER_USER = Mongoose.Schema({
    augeoUser: {type: Mongoose.Schema.Types.ObjectId, ref:'AUGEO_USER'}, // Foreign key
    accessToken: String,
    name: String,
    profileIcon: String,
    profileImageUrl: String,
    screenName: String,
    secretAccessToken:String,
    secretToken:String,
    twitterId: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  TWITTER_USER.statics.add = function(id, secretToken, logData, callback) {

    this.create({
      augeoUser: id,
      secretToken: secretToken
    },function(error1) {
        if(error1) {
          log.functionError(COLLECTION, 'add', logData.parentProcess, logData.username,
            'Failed to save TWITTER_USER for user with id: ' + id + ' Error: ' + error1);
          callback(false);
        } else {
          log.functionCall(COLLECTION, 'add', logData.parentProcess, logData.username, {'id':id}, 'Saved TWITTER_USER');
          callback(true)
        }
      });
  };

  TWITTER_USER.statics.checkExistingAccessToken = function(accessToken, logData, callback) {
    this.count({'accessToken':accessToken}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'checkExistingAccessToken', logData.parentProcess, logData.username,
          'Failed to find count for access token:' + accessToken + '. Error: ' + error);
        callback();
      } else {

        var accessTokenExists = false;
        if(count > 0) {
          accessTokenExists = true;
        }

        log.functionCall(COLLECTION, 'checkExistingAccessToken', logData.parentProcess, logData.username, {'accessToken':accessToken});
        callback(accessTokenExists);
      }
    });
  };

  TWITTER_USER.statics.doesUserExist = function(screenName, logData, callback) {
    this.count({'screenName':screenName}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'checkExistingUser', logData.parentProcess, logData.username,
          'Failed to check if Twitter screen name exists ' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'checkExistingUser', logData.parentProcess, logData.username, {'screenName':screenName});
        var userExists = false;
        if(count > 0) {
          userExists = true;
        }
        callback(userExists);
      }
    });
  };

  TWITTER_USER.statics.getAllQueueData = function(logData, callback) {
    this.find({}, 'augeoUser screenName accessToken secretAccessToken', function(error, users) {
      if(error) {
        log.functionError(COLLECTION, 'getAllUsersTwitterQueueData', logData.parentProcess, logData.username, 'Failed to retrieve users queue data');
      } else {
        log.functionCall(COLLECTION, 'getAllUsersTwitterQueueData', logData.parentProcess, logData.username);
        callback(users);
      }
    });
  };

  TWITTER_USER.statics.getTokens = function(id, logData, callback) {
    this.findOne({augeoUser:id}, {'accessToken':1, 'secretAccessToken':1, 'secretToken':1}, function(error, data) {
      if(error) {
        log.functionError(COLLECTION, 'getTokens', logData.parentProcess, logData.username,
          'Failed to retrieve users access tokens with id:' + id + '. Error: ' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getTokens', logData.parentProcess, logData.username, {'id':id});

        if(data) {
          var tokens = {
            accessToken: data.accessToken,
            secretAccessToken: data.secretAccessToken,
            secretToken: data.secretToken
          }
          callback(tokens);
        } else {
          callback();
        }
      }
    });
  };

  TWITTER_USER.statics.getUsers = function(logData, callback) {
    this.find({}, 'twitterId', function(error, users) {
      if(error) {
        log.functionError(COLLECTION, 'getUsers', logData.parentProcess, logData.username, 'Failed to retrieve users. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getUsers', logData.parentProcess, logData.username);
        callback(users);
      }
    });
  };

  TWITTER_USER.statics.getUserWithScreenName = function(screenName, logData, callback) {
    this.findOne({'screenName':screenName})
      .populate('augeoUser')
      .exec(function(error0, twitterUser) {
        if(error0) {
          log.functionError(COLLECTION, 'getUserWithScreenName', logData.parentProcess, logData.username,
            'Failed to retrieve Twitter user with screen name: ' + screenName + '. Error: ' + error0);
        } else {
          log.functionCall(COLLECTION, 'getUserWithScreenName', logData.parentProcess, logData.username, {'screenName':screenName});

          var user;
          if(twitterUser) {
            // Restructure data
            user = twitterUser.toJSON().augeoUser;
            user.twitter = twitterUser;
          }
          callback(user);
        }
      });
  };

  TWITTER_USER.statics.getUserWithTwitterId = function(twitterId, logData, callback) {
    this.findOne({'twitterId':twitterId})
      .populate('augeoUser', AugeoUser.PROJECTION_STRING)
      .exec(function(error0, twitterUser) {
        if(error0) {
          log.functionError(COLLECTION, 'getUserWithTwitterId', logData.parentProcess, logData.username,
            'Failed to retrieve Twitter user with Twitter ID: ' + twitterId + '. Error: ' + error0);
        } else {
          log.functionCall(COLLECTION, 'getUserWithTwitterId', logData.parentProcess, logData.username, {'twitterId': twitterId}, 'Retrieved Twitter user');

          var user = twitterUser.toJSON().augeoUser;
          user.twitter = twitterUser;

          callback(user);
        }
    });
  };

  TWITTER_USER.statics.remove = function(augeoId, logData, callback) {
    this.findOneAndRemove({augeoUser:augeoId})
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'remove', logData.parentProcess, logData.username, 'Failed to remove Twitter user with augeoId: ' + augeoId + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'remove', logData.parentProcess, logData.username, {'augeoId':augeoId});
        }
        callback(user);
      });
  };

  TWITTER_USER.statics.removeInvalid = function(logData, callback) {
    this.find({screenName:{$eq:null}}, function(error, twitterUsers) {
      if(error) {
        log.functionError(COLLECTION, 'removeInvalid', logData.parentProcess, logData.username,
          'Failed to find invalid Twitter users. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'removeInvalid', logData.parentProcess, logData.username, 'Twitter users found: ' + (twitterUsers)?twitterUsers.length:'invalid');

        // Asynchronous method calls in loop - Using Recursion
        if(twitterUsers.length > 0) {
          (function myClojure(i) {

            var twitterUser = twitterUsers[i];
            twitterUser.remove(function (error1, result) {
              if (error1) {
                log.functionError(COLLECTION, 'removeInvalid', logData.parentProcess, logData.username,
                  'Failed to remove invalid Twitter User with twitterId: ' + (twitterUser) ? twitterUser.twitterId : 'invalid' + '. Error: ' + error);
              } else {
                i++;
                if (i < twitterUsers.length) {
                  myClojure(i);
                } else {
                  log.functionCall(COLLECTION, 'removeInvalid', logData.parentProcess, logData.username, 'complete');
                  callback();
                }
              }
            });
          })(0); // Pass i as 0 to myClojure
        } else {
          log.functionCall(COLLECTION, 'removeInvalid', logData.parentProcess, logData.username, 'complete');
          callback();
        }
      }
    });
  };

  TWITTER_USER.statics.updateUser = function(id, data, username, logData, callback) {

    var query = {augeoUser:id};
    var update = {
      $set:{
        'accessToken': data.accessToken,
        'secretAccessToken': data.secretAccessToken,
        'twitterId': data.twitterId,
        'name': data.name,
        'screenName': data.screenName,
        'profileImageUrl': data.profileImageUrl,
        'profileIcon': data.profileIcon
      }
    };

    this.findOneAndUpdate(query, update, {new:true}).exec(function(error, twitterUser) {
      if(error) {
        log.functionError(COLLECTION, 'updateTwitterInfo', logData.parentProcess, logData.username,
          'Failed to update Twitter data for screenName: ' + (data)?data.screenName:'invalid' + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'updateTwitterInfo', logData.parentProcess, logData.username, {'id':id,
          'data.screenName':(data)?data.screenName:'invalid', 'username':username});

        // Update AugeoUser parent reference
        AugeoUser.getUserWithUsername(username, logData, function(augeoUser) {
          augeoUser.twitter = twitterUser._id;
          augeoUser.save(function(error1) {
            if(error1) {
              log.functionError(COLLECTION, 'update', logData.parentProcess, logData.username,
                'Failed to save AUGEO_USER with _id:' + id + '. Error: ' + error1);
            } else {
              log.functionCall(COLLECTION, 'update', logData.parentProcess, logData.username, {'id':id}, 'Saved AUGEO_USER');
            }
            callback();
          });
        });
      }
    });
  };

  // Declare model
  module.exports = AugeoDB.model('TWITTER_USER', TWITTER_USER);