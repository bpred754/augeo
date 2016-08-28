
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
  var Common = require('../../data/common');
  var TwitterInterface = require('../../../src/interface/twitter-interface');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterValidator = require('../../../src/validator/twitter-validator');

  // Global variables
  var messenger = TwitterInterface.createTwitterMessenger(process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_TOKEN_SECRET, Common.logData);

  it('should receive all necessary tweet data from Twitter', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterInterface.getTweets(messenger, Common.logData, function(error, data, response) {

      data.length.should.be.above(0);

      for(var i = 0; i < data.length; i++) {

        var extract = TwitterInterfaceService.extractTweet(data[i], false, Common.logData);

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

    TwitterInterface.getMentions(messenger, Common.logData, function(error, data, response) {

      data.length.should.be.above(0);
      for(var i = 0; i < data.length; i++) {
        var isValid = false;
        for(var j = 0; j < data[i].entities.user_mentions.length; j++) {
          if(data[i].entities.user_mentions[j].screen_name == process.env.TWITTER_SCREEN_NAME) {
            isValid = true;
          }
        }
        Assert.strictEqual(true, isValid);
      }
      done();
    });
  });

  it('should receive twitter information for authenticated user', function(done) {
    this.timeout(Common.TIMEOUT);

    TwitterInterface.getTwitterData(messenger, process.env.TWITTER_SCREEN_NAME, Common.logData, function(error, userData, response) {
      Assert.strictEqual(process.env.TWITTER_FULL_NAME, userData.name);
      Assert.strictEqual(true, TwitterValidator.containsUserTwitterData(userData, Common.logData));
      done();
    });
  });
