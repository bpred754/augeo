
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
  /* Description: Handles logic related to interfacing with Twitter          */
  /***************************************************************************/

  // Required local modules
  var AugeoUtility = require('../utility/augeo-utility');
  var Logger = require('../module/logger');
  var TwitterClassifier = require('../classifier/twitter-classifier');
  var twitterInterfaceUrl = process.env.TEST === 'true' ? '../../test/interface/twitter-test-interface' : '../interface/twitter-interface';
  var TwitterInterface = require(twitterInterfaceUrl);
  var TwitterUtility = require('../utility/twitter-utility');
  var TwitterValidator = require('../validator/twitter-validator');

  // Global variables
  var classifier = new TwitterClassifier();
  var log = new Logger();

  // Create object to communicate with Twitter
  exports.createTwitterMessenger = function(accessToken, secretAccessToken) {
    return TwitterInterface.createTwitterMessenger(accessToken, secretAccessToken);
  };

  // Extract action data from a Twitter stream action
  exports.extractAction = function(tweetData) {

    var actionerScreenName = '';
    var actioneeScreenName = '';

    // User of tweet that is in reply to
    var replyId = '';
    if(tweetData.in_reply_to_screen_name) {
      actioneeScreenName = tweetData.in_reply_to_screen_name;
      replyId = tweetData.in_reply_to_status_id_str ? tweetData.in_reply_to_status_id_str : '';
    }

    // User of tweet that is being retweeted
    var isRetweet = false;
    var retweetId = '';
    if(tweetData.retweeted_status) {
      actioneeScreenName = tweetData.retweeted_status.user.screen_name;
      retweetId = tweetData.retweeted_status.id_str;
      isRetweet = true;
    }

    return {
      tweetId: tweetData.id_str,
      actionerScreenName: tweetData.user.screen_name,
      actioneeScreenName: actioneeScreenName,
      isRetweet: isRetweet,
      retweetId: retweetId,
      replyId: replyId
    }
  };

  // Extract desired information from mentions
  exports.extractMentionData = function(data, screenName) {

    var mentioneesArray = new Array();

    for(var i = 0; i < data.length; i++) {
      var mentionees = data[i].entities.user_mentions;

      var mentioneeIds = new Array();
      for(var j = 0; j < mentionees.length; j++) {

        if(screenName == mentionees[j].screen_name) {
          var mentioneeData = {
            mentioneeScreenName: mentionees[j].screen_name,
            tweetId:data[i].id_str
          };

          mentioneesArray.push(mentioneeData);
        }
      }
    }

    return mentioneesArray;
  }

  // Extract reply data from tweet
  exports.extractReply = function(tweet) {
    return {
      mentioneeScreenName: tweet.in_reply_to_screen_name ? tweet.in_reply_to_screen_name : '',
      tweetId: tweet.id_str
    };
  };

  // Extract desired information from tweet
  exports.extractTweet = function(data, checkClassification) {

    var text;

    // Determine the amount of experience that will be awarded to the tweet
    var retweetCount = 0;
    var favoriteCount = 0;
    if(!data.retweeted_status) { // Don't count retweets and favorites if tweet was not authored by user
      retweetCount = data.retweet_count;
      favoriteCount = data.favorite_count;
      text = data.text;
    } else {
      text = 'RT @' + data.retweeted_status.user.screen_name + ': ' + data.retweeted_status.text
    }

    var tweetExperience = TwitterUtility.calculateTweetExperience(retweetCount, favoriteCount);
    var classification = classifier.classify(text);

    // Check for an Augeo hashtag and classify text if it is accurate
    if(checkClassification) {
      var tweetHashtags = data.entities.hashtags;
      var classifications = classifier.getClassifications(text);
      for(var j = 0; j < tweetHashtags.length; j++) {
        if(TwitterUtility.containsAugeoHashtag(tweetHashtags[j].text)) {
          for(k = 0; k < 3; k++) { // Only compare first 3 classifications
            if(tweetHashtags[j].text.substring('augeo'.length) === classifications[k].label) {
              classification = classifications[k].label;
              break;
            }
          }
        }
      }
    }

    var tweetData = {
      twitterId: data.user.id_str,
      tweetId: data.id_str,
      name: data.user.name,
      screenName: data.user.screen_name,
      avatarImageSrc: data.user.profile_image_url_https,
      text: text,
      classification: classification,
      classificationGlyphicon: TwitterUtility.getGlyphicon(classification),
      date: data.created_at,
      experience: tweetExperience,
      retweetCount: retweetCount,
      favoriteCount: favoriteCount,
      mentions: data.entities.user_mentions,
      hashtags: data.entities.hashtags,
      links: data.entities.urls,
      media:{
        url:'',
        height:0,
        width:0
      }
    };

    // If media exists
    if(data.entities.media != null) {
      var media = data.entities.media[0];

      // Add media to tweetData
      tweetData.media.url = media.media_url_https + ':large';
      tweetData.media.height = media.sizes.large.h;
      tweetData.media.width = media.sizes.large.w;

      // Remove URL from tweet text
      tweetData.text = tweetData.text.replace(media.url,'');
      tweetData.text = tweetData.text.trim();
    }

    return tweetData;
  };

  // Get twitter mentions from Twitter for user
  exports.getMentions = function(twitterMessenger, screenName, callback, tweetId) {

    // Get Mentions
    TwitterInterface.getMentions(twitterMessenger, function(error, mentionData, response) {

      // Extract relavent data from Twitter's tweet results
      var hasError = false
      var mentionTweets = null;
      var mentions = null;

      if(error) {
        mentionTweets = mentionData // set tweets to error message from twit library
        hasError = true;
      } else {
        mentionTweets = extractTweets(mentionData);
        mentions = exports.extractMentionData(mentionData, screenName);
      }

      callback(hasError, mentionTweets, mentions);

    }, tweetId);
  };

  // Get Oauth access token
  exports.getOAuthAccessToken = function(request, oauthSecretToken, callback, rollback) {

    if(TwitterValidator.isOAuthRequestValid(request)) {

      TwitterInterface.getOAuthAccessToken(request.query, oauthSecretToken, function(oauth_access_token, oauth_access_token_secret, screenName) {
        if(oauth_access_token && oauth_access_token_secret && screenName) {
          callback(oauth_access_token, oauth_access_token_secret, screenName);
        } else {
          rollback();
        }
      });
    } else {
      rollback();
    }
  };

  // Get Oauth request token
  exports.getOAuthRequestToken = function(callback, rollback) {

    TwitterInterface.getOAuthRequestToken(function(oauth_token, oauth_token_secret) {
      if(oauth_token && oauth_token_secret) {
        callback(oauth_token, oauth_token_secret);
      } else {
        rollback();
      }
    });
  };

  // Get tweets for user from Twitter
  exports.getTweets = function(twitterMessenger, callback, tweetId) {

    // Get tweets
    TwitterInterface.getTweets(twitterMessenger, function(error, tweetData, response) {

      // Extract relavent data from Twitter's tweet results
      var hasError = false;
      var tweets = null;

      if(error) {
        tweets = tweetData; // set tweets to error message from twit library
        hasError = true;
      } else {
        tweets = extractTweets(tweetData);
      }

      callback(hasError, tweets);

    }, tweetId);
  };

  // Retrieve user's information from Twitter
  exports.getTwitterUser = function(twitterMessenger, screenName, callback, rollback) {

    // Get user's Twitter information
    TwitterInterface.getTwitterData(twitterMessenger, screenName, function(error, twitterData, response) {

      if(TwitterValidator.containsUserTwitterData(twitterData)) {

        var url = twitterData.profile_image_url_https;
        var urlLength = url.length;

        // Remove _normal.png from profile_image_url_https to receive original image size
        var profileImageUrl = url.substring(0, urlLength-11) + url.substring(url.length-4);

        // Create Twitter sub skills
        var subSkills = TwitterUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(TwitterUtility.getSubSkills()));

        var userData = {
          twitterId: twitterData.id_str,
          name: twitterData.name,
          screenName: screenName,
          profileImageUrl: profileImageUrl,
          isMember: false,
          skill: TwitterUtility.getMainSkill(0),
          subSkills: subSkills,
        }
        callback(userData);
      } else {
        rollback();
      }
    });
  };

  // Open stream with Twitter to catch any updates from specified users
  exports.openStream = function(users, callback, removeCallback, connectedCallback) {

    // create a comma separated list of twitter id's
    var twitterIds = "";
    for(var i = 0; i < users.length; i++) {
      twitterIds += users[i].twitter.twitterId;

      if(i != users.length -1) {
        twitterIds += ", ";
      }
    }

    TwitterInterface.openStream(twitterIds, callback, removeCallback, connectedCallback);
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  // Loop through data and extract tweets
  var extractTweets = function(data, checkClassification) {
    var tweets = new Array(data.length);

    //Loop through each data set and create array of tweets
    for(var i = 0; i < data.length; i++) {
      tweets[i] = exports.extractTweet(data[i], checkClassification);
    }

    return tweets;
  }
