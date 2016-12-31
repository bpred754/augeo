
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
  /* Description: Logic for AUGEO_FLAG database collection                   */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');

  // Constants
  var COLLECTION = 'flag-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var AUGEO_FLAG = Mongoose.Schema({
    activity: {type: Mongoose.Schema.Types.ObjectId, ref: 'ACTIVITY'},
    flaggee: String,
    newClassification: String,
    previousClassification: String,
    reclassifiedDate: Date
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  AUGEO_FLAG.statics.addFlag = function(flag, logData, callback) {
    this.create(flag, function(error, addedFlag) {
      if(error) {
        log.functionError(COLLECTION, 'addFlag', logData.parentProcess, logData.username, 'Failed to add flag with activity: ' + flag.activity + ' to the AUGEO_FLAG collection');
        callback();
      } else {
        log.functionCall(COLLECTION, 'addFlag', logData.parentProcess, logData.username, {'flag.activity': (flag) ? flag.activity : 'invalid'});
        callback(addedFlag);
      }
    });
  };

  AUGEO_FLAG.statics.getFlags = function(date, logData, callback) {
    this.find({reclassifiedDate: date}).lean().exec(function(error, flags) {
      if(error) {
        log.functionError(COLLECTION, 'getFlags', logData.parentProcess, logData.username, 'Failed to get flag with reclassifiedDate: ' + date);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getFlags', logData.parentProcess, logData.username, {'reclassifiedDate': date});
        callback(flags);
      }
    });
  };

  AUGEO_FLAG.statics.removeFlags = function(date, logData, callback) {
    this.remove({reclassifiedDate: date}, function(error, removed) {
      if(error) {
        log.functionError(COLLECTION, 'removeFlags', logData.parentProcess, logData.username, 'Failed to remove flags for date: ' + date);
        callback();
      } else {
        log.functionCall(COLLECTION, 'removeFlags', logData.parentProcess, logData.username, {'date': date});
        callback(removed);
      }
    });
  };


  // Declare Model
  module.exports = AugeoDB.model('AUGEO_FLAG', AUGEO_FLAG);