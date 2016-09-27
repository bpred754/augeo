
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
  /* Description: Unit test cases for queue-task/twitter-event-task          */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../../../src/model/database');
  var Common = require('../../../../data/common');
  var TwitterData = require('../../../../data/twitter-data');
  var TwitterEventTask = require('../../../../../src/queue-task/twitter/event/twitter-event-task');
  var TwitterInterfaceService = require('../../../../../src/interface-service/twitter-interface-service');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');

  it('should do nothing since no tweets were retrieved -- processResult()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new TwitterEventTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.processResult(false, new Array(), Common.logData, function() {

        Assert.strictEqual(task.tweets.length, 0);
        Assert.strictEqual(task.areAllTweetsRetrieved, true);

        done();
      });
    });
  });

  it('should do nothing since only 1 tweets was retrieved with an Id passed in -- processResult()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new TwitterEventTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.nextTweetId = TwitterData.rawStandardTweet.id_str;

      var tweets = new Array();
      tweets.push(TwitterInterfaceService.extractTweet(TwitterData.rawStandardTweet, false, Common.logData));

      task.processResult(false, tweets, Common.logData, function() {

        Assert.strictEqual(task.tweets.length, 0);
        Assert.strictEqual(task.areAllTweetsRetrieved, true);

        done();
      });
    });
  });

  it('should add retrieved tweets to the task tweets array -- processResult()', function(done) {
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new TwitterEventTask(user, TwitterData.USER_TWITTER, null, Common.logData);

      var tweets = new Array();
      tweets.push(TwitterInterfaceService.extractTweet(TwitterData.rawStandardTweet, false, Common.logData));

      task.processResult(false, tweets, Common.logData, function() {

        Assert.strictEqual(task.tweets.length, 1);
        Assert.strictEqual(task.areAllTweetsRetrieved, false);

        done();
      });
    });
  });