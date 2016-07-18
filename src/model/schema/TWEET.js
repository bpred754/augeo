
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
  /* Description: Logic for TWEET database collection                        */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');
  var Schema = Mongoose.Schema;

  // Required local modules
  var AugeoDB = require('../database');
  var Logger = require('../../module/logger');

  // Global variables
  var log = new Logger();

  // Schema decleration
  var TWEET = Mongoose.Schema({
    twitterId: String,
    tweetId: String,
    name: String,
    screenName: String,
    avatarImageSrc: String,
    text: String,
    classification: String,
    classificationGlyphicon: String,
    media: [{
      url: String,
      width: Number,
      height: Number
    }],
    date: String,
    experience: Number,
    retweetCount: Number,
    favoriteCount: Number,
    mentions: [{
      screen_name: String,
      name: String,
      id: Number,
      id_str: String,
      indices:[Number]
    }],
    hashtags: [{
      text: String,
      indices: [Number]
    }],
    links: [{
      url: String,
      expanded_url: String,
      display_url: String,
      indices: [Number]
    }]
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  TWEET.statics.addTweet = function(tweet, callback) {

    // Add tweet if it doesn't exist and update when it does exist
    upsertTweet(this, tweet, callback);
  };

  TWEET.statics.addTweets = function(tweets, callback) {

    // Add tweets if they don't exist and update when they do exist
    upsertTweets(this, tweets, callback);
  };

  TWEET.statics.findTweet = function(tweetId, callback) {
    return this.find({tweetId:tweetId},{},{}, function(error, tweet) {
      if(error) {
        log.warn('Failed to find tweet in TWEET collection with tweetID: ' + tweetId);
      } else {
        log.info('Successfully found tweet in TWEET collecion with tweetID: ' + tweetId);
        callback(tweet);
      }
    });
  };

  TWEET.statics.getLatestTweetId = function(screenName, callback) {
    this.find({screenName:screenName},{},{sort:{'tweetId':-1},limit:1}).lean().exec(function(error, data) {

      if(error) {
        log.warn('Failed to find tweet with max tweetId for user:' + screenName + '. error: ' + error);
      } else {
        log.info('Successfully found tweet with max tweetId for user: ' + screenName);

        var latestTweetId;
        if(data[0]) {
          log.info('Latest TweetId: ' + data[0].tweetId);
          latestTweetId = data[0].tweetId;
        }
        callback(latestTweetId);
      }
    });
  };

  TWEET.statics.getSkillActivity = function(screenName, tweetIds, skill, limit, maxTweetId, callback) {

    if(!maxTweetId) {
      maxTweetId = '9999999999999999999999999999999';
    }

    var query = {};
    if(tweetIds != null) {
      query = {
        $or : [
          {
            $and :[
              {screenName: screenName},
              {tweetId : {$lt: maxTweetId}}
            ]
          },
          {
            $and :[
              {tweetId: {$in: tweetIds}},
              {tweetId: {$lt: maxTweetId}}
            ]
          }
        ]
      };

    } else {
      query = {
        $and :[
          {screenName: screenName},
          {tweetId : {$lt: maxTweetId}},
        ]
      };
    }

    if(skill && skill != 'Augeo') {
      query.classification = skill;
    }

    var options = {
      sort: {'tweetId': -1}
    }

    if(limit) {
      options.limit = limit
    }

    return this.find(query,{}, options, function(error, tweets) {
       if(error) {
         log.warn('Failed to retrieve ' + screenName + ' tweets from TWEET collection for skill:' + skill + '; ' + error);
       } else {
         log.info('Successfully retrieved ' + screenName + ' tweets from TWEET collection for screenName:' + screenName);
         callback(tweets);
       }
     });
  };

  TWEET.statics.getTweetCount = function(callback) {
    this.count({}, function(error, count) {
        if(error) {
          log.warn('Failed to retrieve tweet count from TWEET. ' + error);
        } else {
          log.info('Successfully retrieved tweet count from TWEET.');
          callback(count)
        }
    });
  };

  TWEET.statics.incrementRetweetCount = function(tweetId, callback) {
    this.findOneAndUpdate({tweetId:tweetId}, {$inc: {retweetCount:1}}, function(error) {
      if(error) {
        log.warn('Failed to increment retweet count for tweet with ID: ' + tweetId);
      } else {
        log.info('Successfully incremented retweet count for tweet with ID: ' + tweetId);
        callback();
      }
    });
  };

  TWEET.statics.removeTweet = function(tweetId, callback) {
    this.remove({tweetId:tweetId}, function(error) {
      if(error) {
        log.warn('Failed to remove tweet with id: ' + tweetId + '. Error:' + error);
      } else {
        log.info('Successfully removed tweet with id: ' + tweetId);
        callback();
      }
    });
  };

  TWEET.statics.removeTweets = function(screenName, callback) {
    this.remove({screenName:screenName}, function() {
      callback();
    });
  };

  TWEET.statics.removeTweetsWithMentionee = function(mentioneeScreenName, callback) {
    this.remove({mentions: {$elemMatch: {screen_name:mentioneeScreenName}}}, function() {
      callback();
    });
  };

  TWEET.statics.updateExperience = function(tweetId, experience, callback) {
    this.findOneAndUpdate({tweetId:tweetId}, {$inc: {experience: experience.mainSkillExperience}}, function(error) {
      if(error) {
        log.warn('Failed to update experience for tweet with ID ' + tweetId + ': ' + error);
      } else {
        log.info('Successfully updated experience for tweet with ID: ' + tweetId);
        callback();
      }
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var upsertTweet = function(tweetDocument, tweet, callback) {
    tweetDocument.update({tweetId:tweet.tweetId}, tweet, {upsert:true}, function(error, numAffected) {
      if (error) {
        log.warn('Failed to upsert documents into TWEET collection: ' + error);
      } else {
        log.info('Successfully upserted tweet with tweetID: ' + tweet.tweetId + ' to the TWEET collection.');
        callback();
      }
    });

  };

  var upsertTweets = function(tweetDocument, tweets, callback) {
    var inserted = 0;
    var upsertCallback = function(){};
    for(var i = 0; i < tweets.length; i++) {

      if (++inserted == tweets.length) {
        upsertCallback = callback;
      }

      upsertTweet(tweetDocument, tweets[i], upsertCallback);
    }

  };

  // Declare Model
  var Tweet = module.exports = AugeoDB.model('Tweet', TWEET);
