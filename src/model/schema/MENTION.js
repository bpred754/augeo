
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
  /* Description: Logic for MENTION database collection                      */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');
  var Schema = Mongoose.Schema;

  // Required local modules
  var AugeoDB = require('../database');
  var Logger = require('../../module/logger');

  // Constants
  var COLLECTION = 'mention-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var MENTION = Mongoose.Schema({
    mentioneeScreenName: String, // User being mentioned
    tweetId: String,
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  MENTION.statics.addMention = function(mention, logData, callback) {

    // Add mention if it doesn't exist and update if it does
    upsertMention(this, mention, logData, callback);
  };

  MENTION.statics.addMentions = function(mentions, logData, callback) {

    // Add mentions if they don't exist and update when they do exist
    upsertMentions(this, mentions, logData, callback);
  };

  MENTION.statics.findMention = function(mentioneeScreenName, tweetId, logData, callback) {
    this.find({ $and : [{mentioneeScreenName:mentioneeScreenName}, {tweetId:tweetId}]}, function(error, mention) {
      if(error) {
        log.functionError(COLLECTION, 'findMention', logData.parentProcess, logData.username,
          'Failed to find mention for mentioneeScreenName: ' + mentioneeScreenName + ' and tweetId: ' + tweetId + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'findMention', logData.parentProcess, logData.username, {'mentioneeScreenName':mentioneeScreenName,
          'tweetId':tweetId});
        callback(mention);
      }
    });
  }

  MENTION.statics.getLatestMentionTweetId = function(screenName, logData, callback) {
    this.find({mentioneeScreenName:screenName},{},{sort:{'tweetId':-1},limit:1}).lean().exec(function(error, data) {

      if(error) {
        log.functionError(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username,
          'Failed to find tweet with max mention tweetId for user:' + screenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username, {'screenName':screenName});

        var latestTweetId;
        if(data[0]) {
          log.functionCall(COLLECTION, 'getLatestMentionTweetId', logData.parentProcess, logData.username, {'screenName':screenName},
            'Latest Mention TweetId: ' + data[0].tweetId);
          latestTweetId = data[0].tweetId;
        }
        callback(latestTweetId);
      }
    });
  };

  MENTION.statics.getMention = function(tweetId, logData, callback) {
    this.find({tweetId:tweetId},{},{}, function(error, mention) {
      if(error) {
        log.functionError(COLLECTION, 'getMention', logData.parentProcess, logData.username,
          'Failed to find mention with tweetID: ' + tweetId + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'getMention', logData.parentProcess, logData.username, {'tweetId':tweetId});

        callback(mention);
      }
    });
  };

  MENTION.statics.getMentionCount = function(logData, callback) {
    this.count({}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'getMentionCount', logData.parentProcess, logData.username, 'Failed to retrieve MENTION count. ' + error);
      } else {
        log.functionCall(COLLECTION, 'getMentionCount', logData.parentProcess, logData.username);

        callback(count);
      }
    })
  };

  // Get all the tweetId's for a twitterId
  MENTION.statics.getMentions = function(screenName, logData, callback) {

    this.find({mentioneeScreenName:screenName}, 'tweetId',function(error, mentions) {
      if(error) {
        log.functionError(COLLECTION, 'getMentions', logData.parentProcess, logData.username, 'Failed to retrieve mentions for screenName:' + screenName + '. Error: ' + error);
      } else {

        var mentionsArray = new Array(mentions.length);
        for(var i = 0; i < mentions.length; i++) {
          mentionsArray[i] = mentions[i].tweetId;
        }

        log.functionCall(COLLECTION, 'getMentions', logData.parentProcess, logData.username, {'screenName':screenName});
        callback(mentionsArray);
      }
    });
  };

  MENTION.statics.removeMentions = function(mentioneeScreenName, logData, callback) {
    this.remove({mentioneeScreenName:mentioneeScreenName}, function(error) {
      if(error) {
        log.functionError(COLLECTION, 'removeMentions', logData.parentProcess, logData.username, 'Failed to remove mentions for screenName:' + mentioneeScreenName + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'removeMentions', logData.parentProcess, logData.username, {'mentioneeScreenName':mentioneeScreenName});
      }
      callback();
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var upsertMention = function(model, mention, logData, callback) {
    model.update({mentioneeScreenName:mention.mentioneeScreenName, tweetId:mention.tweetId}, mention, {upsert:true}, function(error, numAffected) {
      if (error) {
        log.functionError(COLLECTION, 'upsertMention (private)', logData.parentProcess, logData.username,'Failed to upsert mentions. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'upsertMention (private)', logData.parentProcess, logData.username,
          {'mention.tweetId':(mention)?mention.tweetId:'invalid'});

        callback(numAffected);
      }
    });
  };

  var upsertMentions = function (model, mentions, logData, callback) {
    var inserted = 0;
    var upsertCallback = function(){};
    for(var i = 0; i < mentions.length; i++) {

      if (++inserted == mentions.length) {
        upsertCallback = callback;
      }
      upsertMention(model, mentions[i], logData, upsertCallback);
    }
  };

  // Declare Model
  var Mention = module.exports = AugeoDB.model('Mention', MENTION);
