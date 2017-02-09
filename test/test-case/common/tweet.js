
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
  /* Description: Unit test cases for common object tweet                    */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Local modules
  var Tweet = require('../../../src/public/javascript/common/tweet');

  it('should format tweet media url to use thumb size -- formatThumbMedia()', function(done) {

    var tweetJson = {
      hashtags: new Array(),
      links: new Array(),
      media: {
        url: 'test123456'
      },
      mentions: new Array(),
      screenName: 'ScreenName',
      text:'test'
    };

    var tweet = new Tweet(tweetJson);
    tweet.formatThumbMedia();

    Assert.strictEqual(tweet.media.url, 'test:thumb');

    done();
  });

  it('should format tweet text with mention into html for client -- formatText()', function(done) {

    var tweetJson = {
      hashtags: new Array(),
      links: new Array(),
      mentions: ['mentionee'],
      screenName: 'ScreenName',
      text:'@mentionee this is a test'
    };

    var tweet = new Tweet(tweetJson);

    Assert.strictEqual(tweet.html, '<a href="https://www.twitter.com/mentionee" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">@mentionee</a> this is a test');

    done();
  });

  it('should format tweet text with screen name into html for client -- formatText()', function(done) {

    var tweetJson = {
      hashtags: new Array(),
      links: new Array(),
      mentions: new Array(),
      screenName: 'ScreenName',
      text:'@ScreenName this is a test'
    };

    var tweet = new Tweet(tweetJson);

    Assert.strictEqual(tweet.html, '<a href="https://www.twitter.com/ScreenName" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">@ScreenName</a> this is a test');

    done();
  });

  it('should format tweet text with hashtag into html for client -- formatText()', function(done) {

    var tweetJson = {
      hashtags: ['augeo'],
      links: new Array(),
      mentions: new Array(),
      screenName: 'ScreenName',
      text:'this is a test #augeo'
    };

    var tweet = new Tweet(tweetJson);

    Assert.strictEqual(tweet.html, 'this is a test <a href="https://www.twitter.com/search?q=%23augeo" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">#augeo</a>');

    done();
  });

  it('should format tweet text with link into html for client -- formatText()', function(done) {

    var tweetJson = {
      hashtags: new Array(),
      links: ['https://www.augeo.io'],
      mentions: new Array(),
      screenName: 'ScreenName',
      text:'check out this link! https://www.augeo.io'
    };

    var tweet = new Tweet(tweetJson);

    Assert.strictEqual(tweet.html, 'check out this link! <a href="https://www.augeo.io" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">https://www.augeo.io</a>');

    done();
  });