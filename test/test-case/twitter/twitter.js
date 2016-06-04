
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
  /* Description: Test cases that verify the data format from Twitter hasn't */
  /*              changed                                                    */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var Common = require('../common');
  var TwitterInterface = require('../../../src/interface/twitter-interface');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterValidator = require('../../../src/validator/twitter-validator');

  // Constants
  var ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
  var SCREEN_NAME = process.env.SCREEN_NAME;
  var SECRET_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  var FULL_NAME = process.env.FULL_NAME;

  // Global variables
  var messenger = TwitterInterface.createTwitterMessenger(ACCESS_TOKEN, SECRET_ACCESS_TOKEN);

  it('should receive all necessary tweet data from Twitter', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterInterface.getTweets(messenger, function(error, data, response) {

      data.length.should.be.above(0);

      for(var i = 0; i < data.length; i++) {

        var extract = TwitterInterfaceService.extractTweet(data[i]);

        extract.twitterId.length.should.be.above(0);
        extract.tweetId.length.should.be.above(0);
        extract.name.length.should.be.above(0);
        extract.screenName.length.should.be.above(0);
        extract.avatarImageSrc.length.should.be.above(0);
        extract.text.length.should.be.above(0);
        extract.classification.length.should.be.above(0);
        extract.classificationGlyphicon.length.should.be.above(0);
        extract.date.length.should.be.above(0);
        extract.experience.should.be.a.Number;
        extract.retweetCount.should.be.a.Number;
        extract.favoriteCount.should.be.a.Number;
        Should.exist(extract.mentions);
        Should.exist(extract.hashtags);
        Should.exist(extract.links);
        Should.exist(extract.media);
      }

      done();
    });
  });

  it('should receive all necessary mention data from Twitter', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterInterface.getMentions(messenger, function(error, data, response) {

      data.length.should.be.above(0);

      var mentions = TwitterInterfaceService.extractMentionData(data, SCREEN_NAME);

      Assert.strictEqual(data.length, mentions.length);

      for(var i = 0; i < mentions.length; i++) {
        Assert.strictEqual(mentions[i].mentioneeScreenName, SCREEN_NAME);
        mentions[i].tweetId.length.should.be.above(0);
      }

      done();
    });
  });

  it('should receive twitter information for authenticated user', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterInterface.getTwitterData(messenger, SCREEN_NAME, function(error, userData, response) {
      Assert.strictEqual(FULL_NAME, userData.name);
      Assert.strictEqual(true, TwitterValidator.containsUserTwitterData(userData));
      done();
    });
  });
