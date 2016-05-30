
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

  MENTION.statics.addMention = function(mention, callback) {

    // Add mention if it doesn's exist and update if it does
    upsertMention(this, mention, callback);
  };

  MENTION.statics.addMentions = function(mentions, callback) {

    // Add mentions if they don't exist and update when they do exist
    upsertMentions(this, mentions, callback);
  };

  MENTION.statics.findMention = function(mentioneeScreenName, tweetId, callback) {
    this.find({ $and : [{mentioneeScreenName:mentioneeScreenName}, {tweetId:tweetId}]}, function(error, mention) {
      if(error) {
        log.warn('Failed to find mention for mentioneeScreenName: ' + mentioneeScreenName + ' and tweetId: ' + tweetId + '. ' + error);
      } else {
        log.info('Successfully found mention for mentioneeScreenName: ' + mentioneeScreenName + ' and tweetId: ' + tweetId);
        callback(mention);
      }
    });
  }

  MENTION.statics.getLatestMentionTweetId = function(screenName, callback) {
    this.find({mentioneeScreenName:screenName},{},{sort:{'tweetId':-1},limit:1}).lean().exec(function(error, data) {

      if(error) {
        log.warn('Failed to find tweet with max mention tweetId for user:' + screenName + '. error: ' + error);
      } else {
        log.info('Successfully found tweet with max mention tweetId for user: ' + screenName);

        var latestTweetId;
        if(data[0]) {
          log.info('Latest Mention TweetId: ' + data[0].tweetId);
          latestTweetId = data[0].tweetId;
        }
        callback(latestTweetId);
      }
    });
  };

  MENTION.statics.getMention = function(tweetId, callback) {
    return this.find({tweetId:tweetId},{},{}, function(error, mention) {
      if(error) {
        log.warn('Failed to find mention in MENTION collection with tweetID: ' + tweetId);
      } else {
        log.info('Successfully found mention in MENTION collecion with tweetID: ' + tweetId);
        callback(mention);
      }
    });
  };

  MENTION.statics.getMentionCount = function(callback) {
    this.count({}, function(error, count) {
      if(error) {
        log.warn('Failed to retrieve MENTION count. ' + error);
      } else {
        log.info('Successfully found MENTION count: ' + count);
        callback(count);
      }
    })
  };

  // Get all the tweetId's for a twitterId
  MENTION.statics.getMentions = function(screenName, callback) {

    return this.find({mentioneeScreenName:screenName}, 'tweetId',function(error, mentions) {
      if(error) {
        log.warn('Failed to retrieve mentions from MENTION collection for screenName:' + screenName + '; ' + error);
      } else {

        var mentionsArray = new Array(mentions.length);
        for(var i = 0; i < mentions.length; i++) {
          mentionsArray[i] = mentions[i].tweetId;
        }

        log.info('Successfully retrieved mentions from MENTION collection for screenName:' + screenName);
        callback(mentionsArray);
      }
    });
  };

  MENTION.statics.removeMentions = function(mentioneeScreenName, callback) {
    this.remove({mentioneeScreenName:mentioneeScreenName}, function() {
      callback();
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var upsertMention = function(model, mention, callback) {
    model.update({mentioneeScreenName:mention.mentioneeScreenName, tweetId:mention.tweetId}, mention, {upsert:true}, function(error, numAffected) {
      if (error) {
        log.warn('Failed to upsert documents into MENTION collection: ' + error);
      } else {
        log.info('Successfully upserted mention with tweetID: ' + mention.tweetId + ' to the MENTION collection');
        callback(numAffected);
      }
    });
  };

  var upsertMentions = function (model, mentions, callback) {
    var inserted = 0;
    var upsertCallback = function(){};
    for(var i = 0; i < mentions.length; i++) {

      if (++inserted == mentions.length) {
        upsertCallback = callback;
      }
      upsertMention(model, mentions[i], upsertCallback);
    }
  };

  // Declare Model
  var Mention = module.exports = AugeoDB.model('Mention', MENTION);
