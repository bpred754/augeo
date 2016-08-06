
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
  /* Description: Unit test cases for test/interface/twitter-test-interface  */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');

  // Required local modules
  var Common = require('../common');
  var Data = require('../../data');
  var TwitterTestInterface = require('../../interface/twitter-test-interface');

  // Global variables
  var messenger = {};

  it('should return 3 raw mentions from test database -- getMentions()', function(done) {
    TwitterTestInterface.getMentions(messenger, Common.logData, function(error, data, response) {
      Assert.strictEqual(data.length, Data.RETRIEVE_LIMIT);

      // Verify all required attributes are in raw data
      for(var i = 0; i < data.length; i++) {
        validateTweet(data[i]);
      }

      done();
    });
  });

  it('should return 3 raw mentions from test database with IDs less than the max ID -- getMentions()', function(done) {

    // Get raw Mentions
    var mentions = Data.getRawMentions();
    Assert.strictEqual(mentions.length, Data.RETRIEVE_LIMIT);

    var maxId = mentions[1].id_str;

    TwitterTestInterface.getMentions(messenger, Common.logData, function(error, data, response) {
      Assert.strictEqual(data.length, Data.RETRIEVE_LIMIT);

      for(var i = 0; i < data.length; i++) {
        validateTweet(data[i]);

        if(i == 0) {
          Assert.strictEqual(maxId, data[i].id_str);
        } else {
          maxId.should.be.above(data[i].id_str);
        }
      }
      done();
    }, maxId);
  });

  it('should return valid access tokens -- getOAuthAccessToken()', function(done) {

    var data = {
      oauth_token: 'valid',
      oauth_verifier: 'valid'
    };

    var oauthSecretToken = 'valid';

    TwitterTestInterface.getOAuthAccessToken(data, oauthSecretToken, Common.logData, function(accessToken, secretAccessToken, screenName) {
      Assert.strictEqual(accessToken.length, 50);
      Assert.strictEqual(secretAccessToken.length, 50);
      Assert.strictEqual(screenName, Common.USER_TWITTER.screenName);
      done();
    });
  });

  it('should return error message due to invalid parameters -- getOAuthAccessToken()', function(done) {
    var data = {
      oauth_token: undefined,
      oauth_verifier: undefined
    };
    var oauthSecretToken;
    TwitterTestInterface.getOAuthAccessToken(data, oauthSecretToken, Common.logData, function(accessToken, secretAccessToken, screenName) {
      Assert.notStrictEqual(accessToken.message, undefined);
      done()
    });
  });

  it('should return valid request tokens -- getOAuthRequestToken()', function(done) {
    TwitterTestInterface.getOAuthRequestToken(Common.logData, function(requestToken, secretRequestToken) {
      Assert.strictEqual(requestToken.length, 32);
      Assert.strictEqual(secretRequestToken.length, 32);
      done()
    });
  });

  it('should return 3 raw tweets from test database -- getTweets()', function(done) {
    TwitterTestInterface.getTweets(messenger, Common.logData, function(error, data, response) {
      Assert.strictEqual(data.length, Data.RETRIEVE_LIMIT);

      // Verify all required attributes are in raw data
      for(var i = 0; i < data.length; i++) {
        validateTweet(data[i]);
      }

      done();
    });
  });

  it('should return 3 raw tweets from test database with IDs less than the max ID -- getTweets()', function(done) {

    // Get raw tweets
    var tweets = Data.getRawTweets();
    Assert.strictEqual(tweets.length, Data.RETRIEVE_LIMIT);
    var maxId = tweets[1].id_str;

    TwitterTestInterface.getTweets(messenger, Common.logData, function(error, data, response) {
      Assert.strictEqual(data.length, Data.RETRIEVE_LIMIT);

      for(var i = 0; i < data.length; i++) {
        validateTweet(data[i]);

        if(i == 0) {
          Assert.strictEqual(maxId, data[i].id_str);
        } else {
          maxId.should.be.above(data[i].id_str);
        }
      }
      done();
    }, maxId);
  });

  it('should return user Twitter data -- getTwitterData()', function(done) {
    TwitterTestInterface.getTwitterData(messenger, Common.USER_TWITTER.screenName, Common.logData, function(error, data, response) {
      Assert.strictEqual(data.id_str, Common.USER_TWITTER.twitterId);
      Assert.strictEqual(data.name, Common.USER.firstName + ' ' + Common.USER.lastName);
      Assert.strictEqual(data.screen_name, Common.USER_TWITTER.screenName);
      Assert.strictEqual(data.profile_image_url_https, "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg");
      done();
    });
  });

  it('should return earliest tweet from the RawTweet collection in the test database -- openStream()', function(done) {

    var twitterIDs = '123456'
    TwitterTestInterface.openStream(twitterIDs, Common.logData, function(tweet) {
      validateTweet(tweet);

      // Verify tweetId is less than all tweet Ids in raw Tweet table
      var testTweet = Data.getMostRecentTweet();
      tweet.id_str.should.be.below(testTweet.id_str);
      done();

    });

    // Submit request to emit tweet event
    Request(process.env.AUGEO_HOME)
      .get('/test-api/emitTweet')
      .expect(200)
      .end(function(error, response) {});
  });

  it('should return earliest mention from the RawTweet collection in the test database -- openStream()', function(done) {

    var twitterIDs = '123456'
    TwitterTestInterface.openStream(twitterIDs, Common.logData, function(tweet) {
      validateTweet(tweet);

      // Verify tweetId is less than all tweet Ids in raw Mention table
      var testTweet = Data.getMostRecentMention();
      tweet.id_str.should.be.below(testTweet.id_str);
      done();
    });

    // Submit request to emit tweet event
    Request(process.env.AUGEO_HOME)
      .get('/test-api/emitMention')
      .expect(200)
      .end(function(error, response) {});
  });

  var validateTweet = function(data) {
    Assert.notEqual(Object.keys(data).indexOf('created_at'), -1);
    Assert.notEqual(Object.keys(data).indexOf('id_str'), -1);
    Assert.notEqual(Object.keys(data).indexOf('text'), -1);
    Assert.notEqual(Object.keys(data).indexOf('in_reply_to_status_id_str'), -1);
    Assert.notEqual(Object.keys(data).indexOf('in_reply_to_user_id_str'), -1);
    Assert.notEqual(Object.keys(data).indexOf('in_reply_to_user_id_str'), -1);
    Assert.notEqual(Object.keys(data).indexOf('user'), -1);
    Assert.notEqual(Object.keys(data).indexOf('retweet_count'), -1);
    Assert.notEqual(Object.keys(data).indexOf('favorite_count'), -1);
    Assert.notEqual(Object.keys(data).indexOf('entities'), -1);
    Assert.notEqual(Object.keys(data).indexOf('favorited'), -1);
    Assert.notEqual(Object.keys(data).indexOf('retweeted'), -1);
  };
