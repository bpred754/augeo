
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
  /* Description: Unit test cases for queue/base-queue                       */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../../data/common');
  var TwitterData = require('../../data/twitter-data');
  var TwitterEventQueue = require('../../../src/queue/twitter-event-queue');
  var TwitterTweetTask = require('../../../src/queue-task/twitter/event/twitter-tweet-task');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');

  it('should get user wait time when user is in the current task slot -- getUserWaitTime()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.maxTaskExecutionTime = 10;

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.wait = 1000000;
      queue.addTask(task, Common.logData);

      // Wait for task to be executed
      setTimeout(function() {

        var waitTime = queue.getUserWaitTime(user._id, Common.logData);
        Assert.strictEqual(waitTime, 10);

        done();
      }, 500);
    });
  });

  it('should get users wait time when they are not in the current task slot -- getUserWaitTime()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.maxTaskExecutionTime = 10;

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(task, Common.logData);

      var waitTime = queue.getUserWaitTime(user._id, Common.logData);
      Assert.strictEqual(waitTime, 20);

      done();
    });
  });

  it('should return the wait time for a new user if there are users in the queue and a user in the current task slot -- getWaitTime', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.maxTaskExecutionTime = 10;

      var task0 = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task0.wait = 1000000;
      queue.addTask(task0, Common.logData);

      var task1 = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task1.wait = 1000000;
      queue.queue.tasks.push(task1);

      // Wait for task0 to get executed
      setTimeout(function() {
        var waitTime = queue.getWaitTime(Common.logData);
        Assert.strictEqual(waitTime, 20);
        done();
      }, 500);
    });
  });

  it('should return wait time for new user if there are users in the queue but not in the current task slot -- getWaitTime()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.maxTaskExecutionTime = 10;

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(task, Common.logData);

      var waitTime = queue.getWaitTime(Common.logData);
      Assert.strictEqual(waitTime, 10);

      done();
    });
  });

  it('should not add a task to the queue due to a duplicate entry -- isAddRequestValid()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);

      var task0 = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(task0, Common.logData);

      var task1 = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.isAddRequestValid(task1, function(isRequestValid) {
        Assert.strictEqual(isRequestValid, false);

        done();
      });
    });
  });

  it('should add a task to the queue -- isAddRequestValid()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);

      var task0 = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(task0, Common.logData);

      var user1 = JSON.parse(JSON.stringify(user));
      user1._id = '111';
      var task1 = new TwitterTweetTask(user1, TwitterData.USER_TWITTER, null, Common.logData);
      queue.isAddRequestValid(task1, function(isRequestValid) {
        Assert.strictEqual(isRequestValid, true);
        done();
      });
    });
  });

  it('should set queue wait time to 0 when queue is not busy -- prepareTask()', function(done) {

    var queue = new TwitterEventQueue(Common.logData, false);
    queue.taskWaitTime = 10;

    queue.prepareTask();
    Assert.strictEqual(queue.taskWaitTime, 0);
    done();
  });

  it('should set queue wait time to the task wait time when queue is busy -- prepareTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.taskWaitTime = 10;
      queue.isBusy = true;

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.wait = 1000000;
      queue.addTask(task, Common.logData);

      queue.prepareTask(task);
      Assert.strictEqual(queue.taskWaitTime, 1000000);
      done();
    });
  });