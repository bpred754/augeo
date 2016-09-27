
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
  /* Description: Unit test cases for queue/twitter-connect-queue            */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var Common = require('../../data/common');
  var TwitterConnectQueue = require('../../../src/queue/twitter-connect-queue');
  var TwitterEventQueue = require('../../../src/queue/twitter-event-queue');
  var TwitterStreamQueue = require('../../../src/queue/twitter-stream-queue');

  it('should add all Twitter users to both tweet and mention queues -- addUsersToEventQueues()', function(done) {

    var tweetQueue = new TwitterEventQueue(Common.logData, false);
    var mentionQueue = new TwitterEventQueue(Common.logData, true);
    var streamQueue = new TwitterStreamQueue(Common.logData);

    var connectQueue = new TwitterConnectQueue(tweetQueue, mentionQueue, streamQueue, Common.logData);
    connectQueue.addUsersToEventQueues(Common.logData, function() {
      var connectTweetQueue = connectQueue.tweetQueue;
      var connectMentionQueue = connectQueue.mentionQueue;

      connectTweetQueue.currentTask.user.should.be.ok();
      connectMentionQueue.currentTask.user.should.be.ok();

      Assert.strictEqual(connectTweetQueue.queue.tasks.length, 1);
      Assert.strictEqual(connectMentionQueue.queue.tasks.length, 1);
      done();
    });
  });

  it('should add a connect task to the queue -- connectToTwitter()', function(done) {

    var tweetQueue = new TwitterEventQueue(Common.logData, false);
    var mentionQueue = new TwitterEventQueue(Common.logData, true);
    var streamQueue = new TwitterStreamQueue(Common.logData);

    var connectQueue = new TwitterConnectQueue(tweetQueue, mentionQueue, streamQueue, Common.logData);
    connectQueue.connectToTwitter(Common.logData, function() {

      Assert.strictEqual(connectQueue.queue.tasks.length, 1);
      done();
    });
  });

