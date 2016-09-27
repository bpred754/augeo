
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
  /* Description: Unit test cases for queue/twitter-event-queue              */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../../data/common');
  var TwitterData = require('../../data/twitter-data');
  var TwitterEventQueue = require('../../../src/queue/twitter-event-queue');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterTweetTask = require('../../../src/queue-task/twitter/event/twitter-tweet-task');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');
  var TwitterUser = AugeoDB.model('TWITTER_USER');

  it('should add all Twitter users to the TwitterEventQueue -- addAllUsers()', function(done) {
    TwitterUser.getAllUsers(Common.logData, function(users) {

      var queue = new TwitterEventQueue(Common.logData);
      queue.taskWaitTime = 100000;
      queue.addAllUsers(Common.logData, function() {
        queue.currentTask.user.should.be.ok();
        Assert.strictEqual(queue.queue.tasks.length, 1);
        done();
      });
    });
  });

  it('should add a Task onto the TwitterEventQueue - addTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);

      var queue = new TwitterEventQueue(Common.logData, false);
      queue.addTask(task, Common.logData);

      Assert.strictEqual(queue.queue.tasks.length, 1);
      Assert.strictEqual(queue.queue.tasks[0].data.user._id, user._id);
      done();
    });
  });

  it('should not add Task onto the TwitterEventQueue due to a duplicate -- addTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);

      var taskInQueue = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(taskInQueue, Common.logData);

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(task, Common.logData);

      Assert.strictEqual(queue.queue.tasks.length, 1);
      Assert.strictEqual(queue.queue.tasks[0].data.user._id, user._id);

      done();
    });
  });

  it('should unshift task onto queue when there are more tweets to be fetched -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);

      var userInQueue = JSON.parse(JSON.stringify(user));
      userInQueue._id = '111';
      var taskInQueue = new TwitterTweetTask(userInQueue, TwitterData.USER_TWITTER, null, Common.logData);
      queue.addTask(taskInQueue, Common.logData);

      var task =new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      queue.finishTask(task, Common.logData, function() {

        Assert.strictEqual(queue.queue.tasks.length, 2);
        Assert.strictEqual(queue.queue.tasks[0].data.user._id, user._id);

        done();
      });
    });
  });

  it('should do nothing when no tweets were retrieved and there are no more to fetch -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var queue = new TwitterEventQueue(Common.logData, false);

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.areAllTweetsRetrieved = true;
      queue.finishTask(task, Common.logData, function() {

        Assert.strictEqual(queue.queue.tasks.length, 0);

        done();
      });
    });
  });

  it('should add all tweets retrieved from Twitter -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      // Get user experience baseline
      var baselineExperience = user.skill.experience;

      var queue = new TwitterEventQueue(Common.logData, false);

      var task = new TwitterTweetTask(user, TwitterData.USER_TWITTER, null, Common.logData);
      task.areAllTweetsRetrieved = true;

      // Get Tweets
      TwitterInterfaceService.getTweets({}, Common.logData, function(hasError, tweets) {
        Assert.strictEqual(hasError, false);

        task.tweets = tweets;
        var addedExperience = 0;
        for(var i = 0; i < tweets.length; i++) {
         addedExperience += tweets[i].experience;
        }

        queue.finishTask(task, Common.logData, function() {

          // Get updated user
          User.getUserWithUsername(Common.USER.username, Common.logData, function(updatedUser) {

            Assert.strictEqual(updatedUser.skill.experience, baselineExperience + addedExperience);
            Assert.strictEqual(queue.queue.tasks.length, 0);
            done();
          });
        });
      });
    });
  });