
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
  /* Description: Logic for AUGEO_STAGED_FLAG database collection            */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'staged-flag-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var AUGEO_STAGED_FLAG = Mongoose.Schema({
    activityId: Mongoose.Schema.Types.ObjectId,
    currentClassification: String,
    reclassifyDate: Date,
    suggestedClassification: String,
    timestamp: Date,
    username: String,
    votes: Number
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  AUGEO_STAGED_FLAG.statics.addVotes = function(stagedFlag, logData, callback) {

    this.findOneAndUpdate({$and: [{username: stagedFlag.username}, {activityId: stagedFlag.activityId}]}, stagedFlag, { upsert: true, 'new': true},
      function (error, updatedActivity) {
        if (error) {
          log.functionError(COLLECTION, 'addVotes', logData.parentProcess, logData.username,
            'Failed to add votes for staged flag with activityId: ' + (stagedFlag) ? stagedFlag.activityId : 'invalid' + '. Error: ' + error);
          callback();
        } else {
          log.functionCall(COLLECTION, 'addVotes', logData.parentProcess, logData.username, {'stagedFlag.activityId': (stagedFlag) ? stagedFlag.activityId : 'invalid'});
          callback(updatedActivity);
        }
      });
  };

  AUGEO_STAGED_FLAG.statics.getStagedFlags = function(date, logData, callback) {
    this.find({reclassifyDate: date}).lean().exec(function(error, stagedFlags) {
      if(error) {
        log.functionError(COLLECTION, 'getStagedFlags', logData.parentProcess, logData.username, 'Failed to get staged flag with reclassifyDate: ' + date);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getStagedFlags', logData.parentProcess, logData.username, {'reclassifyDate': date});
        callback(stagedFlags);
      }
    });
  };

  AUGEO_STAGED_FLAG.statics.getStagedFlagsWithActivityIds = function(activityIds, username, logData, callback) {
    this.find({$and: [{username: username}, {activityId: {$in: activityIds}}]}, function(error, stagedFlags) {
      if(error) {
        log.functionError(COLLECTION, 'getStagedFlagsWithActivityIds', logData.parentProcess, logData.username, 'Failed to get staged flags for activityIds. length: ' + (activityIds) ? activityIds.length: 'invalid');
        callback();
      } else {
        log.functionCall(COLLECTION, 'getStagedFlagsWithActivityIds', logData.parentProcess, logData.username, {'activityIds.length':(activityIds) ? activityIds.length: 'invalid'});
        callback(stagedFlags);
      }
    });
  };

  AUGEO_STAGED_FLAG.statics.removeStagedFlags = function(date, logData, callback) {
    this.remove({reclassifyDate: date}, function(error, removed) {
      if(error) {
        log.functionError(COLLECTION, 'removeStagedFlags', logData.parentProcess, logData.username, 'Failed to remove staged flags for date: ' + date);
        callback();
      } else {
        log.functionCall(COLLECTION, 'removeStagedFlags', logData.parentProcess, logData.username, {'date': date});
        callback(removed);
      }
    });
  };

  // Declare Model
  module.exports = AugeoDB.model('AUGEO_STAGED_FLAG', AUGEO_STAGED_FLAG);