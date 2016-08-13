
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
  /* Description: Unit test cases for                                        */
  /*              interface-service/twitter-interface-service                */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');

  // Required local modules
  var Common = require('../common');
  var Data = require('../../data');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');

  it('should extract and return relevant action information from a raw tweet -- extractAction()', function(done) {

    var tweetAction = TwitterInterfaceService.extractAction(Common.standardRawTweetCondensed, Common.logData);
    Assert.strictEqual(tweetAction.tweetId, Common.standardRawTweetCondensed.id_str);
    Assert.strictEqual(tweetAction.actionerScreenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(tweetAction.actioneeScreenName, '');
    Assert.strictEqual(tweetAction.isRetweet, false);
    Assert.strictEqual(tweetAction.retweetId, '');
    Assert.strictEqual(tweetAction.replyId, '');

    var replyToUserAction = TwitterInterfaceService.extractAction(Common.rawTweetWithMentionCondensed, Common.logData);
    Assert.strictEqual(replyToUserAction.tweetId, Common.rawTweetWithMentionCondensed.id_str);
    Assert.strictEqual(replyToUserAction.actionerScreenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(replyToUserAction.actioneeScreenName, Common.ACTIONEE_TWITTER.screenName);
    Assert.strictEqual(replyToUserAction.isRetweet, false);
    Assert.strictEqual(replyToUserAction.retweetId, '');
    Assert.strictEqual(replyToUserAction.replyId, '');

    var replyToPostAction = TwitterInterfaceService.extractAction(Common.rawReplyToPostCondensed, Common.logData);
    Assert.strictEqual(replyToPostAction.tweetId, Common.rawReplyToPostCondensed.id_str);
    Assert.strictEqual(replyToPostAction.actionerScreenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(replyToPostAction.actioneeScreenName, Common.ACTIONEE_TWITTER.screenName);
    Assert.strictEqual(replyToPostAction.isRetweet, false);
    Assert.strictEqual(replyToPostAction.retweetId, '');
    Assert.strictEqual(replyToPostAction.replyId, Common.rawReplyToPostCondensed.in_reply_to_status_id_str);

    var retweetAction = TwitterInterfaceService.extractAction(Common.rawRetweetCondensed, Common.logData);
    Assert.strictEqual(retweetAction.tweetId, Common.rawRetweetCondensed.id_str);
    Assert.strictEqual(retweetAction.actionerScreenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(retweetAction.actioneeScreenName, Common.ACTIONEE_TWITTER.screenName);
    Assert.strictEqual(retweetAction.isRetweet, true);
    Assert.strictEqual(retweetAction.retweetId, Common.rawRetweetCondensed.retweeted_status.id_str);
    Assert.strictEqual(retweetAction.replyId, '');

    done();
  });

  it('should extract and return relevant tweet information from a raw tweet -- extractTweet()', function(done) {

    var extractedtweet = TwitterInterfaceService.extractTweet(Common.rawStandardTweet, true, Common.logData);
    Assert.strictEqual(extractedtweet.twitterId, Common.USER_TWITTER.twitterId);
    Assert.strictEqual(extractedtweet.tweetId, Common.rawStandardTweet.id_str);
    Assert.strictEqual(extractedtweet.name, Common.USER.fullName);
    Assert.strictEqual(extractedtweet.screenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(extractedtweet.avatarImageSrc, 'https://abs.twimg.com/images/themes/theme1/bg.png');
    Assert.strictEqual(extractedtweet.text, 'testing retweets');
    Assert.strictEqual(extractedtweet.classification, 'General');
    Assert.strictEqual(extractedtweet.classificationGlyphicon, 'glyphicon-globe');
    Assert.strictEqual(extractedtweet.date, 'Mon Mar 30 21:54:28 +0000 2015');
    Assert.strictEqual(extractedtweet.experience, 80);
    Assert.strictEqual(extractedtweet.retweetCount, 1);
    Assert.strictEqual(extractedtweet.favoriteCount, 0);
    Assert.strictEqual(extractedtweet.mentions.length, 0);
    Assert.strictEqual(extractedtweet.hashtags.length, 0);
    Assert.strictEqual(extractedtweet.links.length, 0);
    Assert.strictEqual(extractedtweet.media.url,'');
    Assert.strictEqual(extractedtweet.media.height,0);
    Assert.strictEqual(extractedtweet.media.width,0);

    var extractedTweetWithMention = TwitterInterfaceService.extractTweet(Common.rawTweetWithMention, true, Common.logData);
    Assert.strictEqual(extractedTweetWithMention.twitterId, Common.USER_TWITTER.twitterId);
    Assert.strictEqual(extractedTweetWithMention.tweetId, Common.rawTweetWithMention.id_str);
    Assert.strictEqual(extractedTweetWithMention.name, Common.USER.fullName);
    Assert.strictEqual(extractedTweetWithMention.screenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(extractedTweetWithMention.avatarImageSrc, 'https://abs.twimg.com/images/themes/theme1/bg.png');
    Assert.strictEqual(extractedTweetWithMention.text, '@twitterActionee Are my tweets being extracted correctly?');
    Assert.strictEqual(extractedTweetWithMention.classification, 'General');
    Assert.strictEqual(extractedTweetWithMention.classificationGlyphicon, 'glyphicon-globe');
    Assert.strictEqual(extractedTweetWithMention.date, 'Sat Jun 20 23:24:29 +0000 2015');
    Assert.strictEqual(extractedTweetWithMention.experience, 30);
    Assert.strictEqual(extractedTweetWithMention.retweetCount, 0);
    Assert.strictEqual(extractedTweetWithMention.favoriteCount, 0);
    Assert.strictEqual(extractedTweetWithMention.mentions.length, 1);
    Assert.strictEqual(extractedTweetWithMention.mentions[0], Common.ACTIONEE_TWITTER.screenName);
    Assert.strictEqual(extractedTweetWithMention.hashtags.length, 0);
    Assert.strictEqual(extractedTweetWithMention.links.length, 0);
    Assert.strictEqual(extractedTweetWithMention.media.url,'');
    Assert.strictEqual(extractedTweetWithMention.media.height,0);
    Assert.strictEqual(extractedTweetWithMention.media.width,0);

    var extractedTweetWithHashtag = TwitterInterfaceService.extractTweet(Common.rawTweetWithHashtag, true, Common.logData);
    Assert.strictEqual(extractedTweetWithHashtag.twitterId, Common.USER_TWITTER.twitterId);
    Assert.strictEqual(extractedTweetWithHashtag.tweetId, Common.rawTweetWithHashtag.id_str);
    Assert.strictEqual(extractedTweetWithHashtag.name, Common.USER.fullName);
    Assert.strictEqual(extractedTweetWithHashtag.screenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(extractedTweetWithHashtag.avatarImageSrc, 'https://abs.twimg.com/images/themes/theme1/bg.png');
    Assert.strictEqual(extractedTweetWithHashtag.text, 'testing hashtag');
    Assert.strictEqual(extractedTweetWithHashtag.classification, 'Business');
    Assert.strictEqual(extractedTweetWithHashtag.classificationGlyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(extractedTweetWithHashtag.date, 'Thu Dec 31 23:24:29 +0000 2015');
    Assert.strictEqual(extractedTweetWithHashtag.experience, 30);
    Assert.strictEqual(extractedTweetWithHashtag.retweetCount, 0);
    Assert.strictEqual(extractedTweetWithHashtag.favoriteCount, 0);
    Assert.strictEqual(extractedTweetWithHashtag.mentions.length, 0);
    Assert.strictEqual(extractedTweetWithHashtag.hashtags.length, 1);
    Assert.strictEqual(extractedTweetWithHashtag.hashtags[0], 'augeoBusiness');
    Assert.strictEqual(extractedTweetWithHashtag.links.length, 0);
    Assert.strictEqual(extractedTweetWithHashtag.media.url,'');
    Assert.strictEqual(extractedTweetWithHashtag.media.height,0);
    Assert.strictEqual(extractedTweetWithHashtag.media.width,0);

    var extractedRetweet = TwitterInterfaceService.extractTweet(Common.rawRetweet, true, Common.logData);
    Assert.strictEqual(extractedRetweet.twitterId, Common.USER_TWITTER.twitterId);
    Assert.strictEqual(extractedRetweet.tweetId, Common.rawRetweet.id_str);
    Assert.strictEqual(extractedRetweet.name, Common.USER.fullName);
    Assert.strictEqual(extractedRetweet.screenName, Common.USER_TWITTER.screenName);
    Assert.strictEqual(extractedRetweet.avatarImageSrc, 'https://abs.twimg.com/images/themes/theme1/bg.png');
    Assert.strictEqual(extractedRetweet.text, 'RT @Gizmodo: A new type of Dyson sphere may be nearly impossible to detect: http://t.co/oIyRqJ2jcv');
    Assert.strictEqual(extractedRetweet.classification, 'General');
    Assert.strictEqual(extractedRetweet.classificationGlyphicon, 'glyphicon-globe');
    Assert.strictEqual(extractedRetweet.date, 'Sat Mar 28 20:15:48 +0000 2015');
    Assert.strictEqual(extractedRetweet.experience, 30);
    Assert.strictEqual(extractedRetweet.retweetCount, 0);
    Assert.strictEqual(extractedRetweet.favoriteCount, 0);
    Assert.strictEqual(extractedRetweet.mentions.length, 1);
    Assert.strictEqual(extractedRetweet.mentions[0], 'Gizmodo');
    Assert.strictEqual(extractedRetweet.hashtags.length, 0);
    Assert.strictEqual(extractedRetweet.links.length, 1);
    Assert.strictEqual(extractedRetweet.links[0], 'http://t.co/oIyRqJ2jcv');
    Assert.strictEqual(extractedRetweet.media.url, 'https://pbs.twimg.com/media/CBNbTEUW8AA5Yxj.jpg:large');
    Assert.strictEqual(extractedRetweet.media.height, 150);
    Assert.strictEqual(extractedRetweet.media.width, 150);

    done();
  });

  it('should return list of extracted mentions from the test database -- getMentions()', function(done) {

    var twitterMessenger = {};
    TwitterInterfaceService.getMentions(twitterMessenger, Common.logData, function(error, mentionTweets) {
      Assert.strictEqual(error, false);

      Assert.strictEqual(mentionTweets.length, Data.RETRIEVE_LIMIT);
      for(var i = 0; i < mentionTweets.length; i++) {
        var tweet = mentionTweets[i];
        validateExtractedTweet(tweet);

        // Verify tweet has at least 1 mention
        tweet.mentions.length.should.be.above(0);
      }

      done();
    });
  });

  it('should return valid OAuth access tokens -- getOAuthAccessToken()', function(done) {

    var callbackFailure = function() {
      console.log('** TwitterInterfaceService.getOAuthAccessToken() -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** TwitterInterfaceService.getOAuthAccessToken() -- in rollback, test failed **');
    };

    // Invalid Request
    var invalidQuery = {};
    TwitterInterfaceService.getOAuthAccessToken(invalidQuery, '000000000000', Common.logData, callbackFailure, function() {

      // Invalid oauth secret token
      var validQuery = {
        oauth_token: '111111111',
        oauth_verifier: '22222222'
      }
      var invalidSecretToken;
      TwitterInterfaceService.getOAuthAccessToken(validQuery, invalidSecretToken, Common.logData, callbackFailure, function() {

        // Valid request and oauth secret token
        TwitterInterfaceService.getOAuthAccessToken(validQuery, '000000000000', Common.logData, function(accessToken, secretAccessToken, screenName) {

          Assert.strictEqual(typeof accessToken, 'string');
          Assert.strictEqual(accessToken.length, 50);

          Assert.strictEqual(typeof secretAccessToken, 'string');
          Assert.strictEqual(secretAccessToken.length, 50);

          Assert.strictEqual(screenName, Common.USER_TWITTER.screenName);

          done();
        }, rollbackFailure);
      });
    });
  });

  it('should return valid OAuth request tokens -- getOAuthRequestToken()', function(done) {

    TwitterInterfaceService.getOAuthRequestToken(Common.logData, function(requestToken, secretRequestToken) {

      Assert.strictEqual(typeof requestToken, 'string');
      Assert.strictEqual(requestToken.length, 32);

      Assert.strictEqual(typeof secretRequestToken, 'string');
      Assert.strictEqual(secretRequestToken.length, 32);

      done();
    }, function(){
      console.log('** TwitterInterfaceService.getOauthRequestToken() -- in rollback, test failed **');
    });

  });

  it('should return list of extracted tweets from the test database -- getTweets()', function(done) {
    var twitterMessenger = {};
    TwitterInterfaceService.getTweets(twitterMessenger, Common.logData, function(error, tweets) {
      Assert.strictEqual(error, false);

      Assert.strictEqual(tweets.length, Data.RETRIEVE_LIMIT);
      for(var i = 0; i < tweets.length; i++) {
        validateExtractedTweet(tweets[i]);
      }
      done();
    });
  });

  it("should return an extracted user's Twitter data from the test database given a Twitter screen name -- getTwitterUser()", function(done) {

    var callbackFailure = function() {
      console.log('** TwitterInterfaceService.getTwitterUser() -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** TwitterInterfaceService.getTwitterUser() -- in rollback, test failed **');
    };

    var twitterMessenger = {};

    // Invalid screen name
    TwitterInterfaceService.getTwitterUser(twitterMessenger, 'invalidScreenName', Common.logData, callbackFailure, function() {

      // Valid screen name
      TwitterInterfaceService.getTwitterUser(twitterMessenger, Common.USER_TWITTER.screenName, Common.logData, function(userData) {

        Assert.strictEqual(userData.twitterId, Common.USER_TWITTER.twitterId);
        Assert.strictEqual(userData.name, Common.USER.fullName);
        Assert.strictEqual(userData.screenName, Common.USER_TWITTER.screenName);
        Assert.strictEqual(userData.profileImageUrl, 'https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs.jpg');

        done();
      }, rollbackFailure);
    });
  });

  it('should open a test stream to simulate Twitter stream -- openStream()', function(done) {

    var userIds = new Array();
    userIds.push({
      twitter: {
        twitterId: Common.USER_TWITTER.twitterId
      }
    });

    TwitterInterfaceService.openStream(userIds, Common.logData, function(data) {

      // TweetId
      Assert.strictEqual(typeof data.id_str, 'string');
      data.id_str.length.should.be.above(1);
      // Tweet text
      Assert.strictEqual(typeof data.text, 'string');
      data.text.length.should.be.above(1);
      // UserId
      Assert.strictEqual(typeof data.user.id_str, 'string');
      data.user.id_str.length.should.be.above(1);

      done();
    });

    // Submit request to emit tweet event
    Request(process.env.AUGEO_HOME)
      .get('/test-api/emitTweet')
      .expect(200)
      .end(function(error, response) {});

  });

  var validateExtractedTweet = function(tweet) {
    // TwitterId
    Assert.strictEqual(typeof tweet.twitterId, 'string');
    tweet.twitterId.length.should.be.above(1);
    // TweetId
    Assert.strictEqual(typeof tweet.tweetId, 'string');
    tweet.tweetId.length.should.be.above(1);
    // name
    Assert.strictEqual(typeof tweet.name, 'string');
    tweet.name.length.should.be.above(1);
    // screenName
    Assert.strictEqual(typeof tweet.screenName, 'string');
    tweet.screenName.length.should.be.above(1);
    // avatarImageSrc
    Assert.strictEqual(typeof tweet.avatarImageSrc, 'string');
    tweet.avatarImageSrc.length.should.be.above(1);
    // text
    Assert.strictEqual(typeof tweet.text, 'string');
    tweet.text.length.should.be.above(1);
    // classification
    Assert.strictEqual(typeof tweet.classification, 'string');
    tweet.classification.length.should.be.above(1);
    // classificationGlyphicon
    Assert.strictEqual(typeof tweet.classificationGlyphicon, 'string');
    tweet.classificationGlyphicon.length.should.be.above(1);
    // date
    Assert.strictEqual(typeof tweet.date, 'string');
    tweet.date.length.should.be.above(1);
    // experience
    Assert.strictEqual(typeof tweet.experience, 'number');
    tweet.experience.should.be.above(-1);
    // retweetCount
    Assert.strictEqual(typeof tweet.retweetCount, 'number');
    tweet.retweetCount.should.be.above(-1);
    // favoriteCount
    Assert.strictEqual(typeof tweet.favoriteCount, 'number');
    tweet.favoriteCount.should.be.above(-1);
    // mentions
    Assert.strictEqual(tweet.mentions.constructor, Array);
    tweet.mentions.length.should.be.above(-1);
    // hashtags
    Assert.strictEqual(tweet.hashtags.constructor, Array);
    tweet.hashtags.length.should.be.above(-1);
    // links
    Assert.strictEqual(tweet.links.constructor, Array);
    tweet.links.length.should.be.above(-1);
    // media
    Assert.strictEqual(typeof tweet.media, 'object');
  };
