
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
  /* Description: Unit test cases for queue-task/twitter-tweet-task          */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../../../src/model/database');
  var Common = require('../../../../data/common');
  var TwitterData = require('../../../../data/twitter-data');
  var TwitterTweetTask = require('../../../../../src/queue-task/twitter/event/twitter-tweet-task');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');

  it('should retrieve tweets from TwitterTestInterface -- execute()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.execute(Common.logData, function(updatedTask) {

        updatedTask.tweets.length.should.be.above(0);
        Assert.strictEqual(updatedTask.tweets[0].screenName, TwitterData.USER_TWITTER.screenName);

        done();
      });
    });
  });