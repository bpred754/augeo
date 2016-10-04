
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
  /* Description: Unit test cases for queue/github-event-queue               */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../../data/common');
  var GithubData = require('../../data/github-data');
  var GithubEventQueue = require('../../../src/queue/github-event-queue');
  var GithubEventTask = require('../../../src/queue-task/github/github-event-task');
  var GithubInterfaceService = require('../../../src/interface-service/github-interface-service');

  // Global variables
  var GithubUser = AugeoDB.model('GITHUB_USER');
  var User = AugeoDB.model('AUGEO_USER');
  var githubData = {
    accessToken: GithubData.USER_GITHUB.accessToken,
    screenName: GithubData.USER_GITHUB.screenName
  };

  it('should add all Github users to queue -- addAllUsers()', function(done) {

    GithubUser.getAllUsers(Common.logData, function(users) {
      var numberUsers = users.length;

      var queue = new GithubEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addAllUsers(Common.logData, function() {
        Assert.strictEqual(queue.queue.tasks.length, numberUsers);
        queue.reset();
        done();
      });
    });
  });

  it('should push task onto queue, not insert. Add request is valid and no tasks in queue have last event ID -- addTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(userInQueue) {

      var inQueueTask = new GithubEventTask(userInQueue, githubData, null, Common.logData);

      var queue = new GithubEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Change user _id so the add request is still valid
      var user = JSON.parse(JSON.stringify(userInQueue));
      user._id = '111';

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      queue.addTask(task, Common.logData);

      // Second task should have updated user _id
      Assert.strictEqual(queue.queue.tasks[1].data.user._id, '111');

      queue.reset();
      done();
    });
  });

  it('should insert task onto queue, not push. Add request is value and a task in the queue has a last event ID -- addTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(userInQueue) {

      var inQueueTask = new GithubEventTask(userInQueue, githubData, '222', Common.logData);

      var queue = new GithubEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Change user _id so the add request is still valid
      var user = JSON.parse(JSON.stringify(userInQueue));
      user._id = '111';

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      queue.addTask(task, Common.logData);

      // First task should have updated user _id
      Assert.strictEqual(queue.queue.tasks[0].data.user._id, '111');

      queue.reset();
      done();
    });
  });

  it('should not add task to queue since user is already on it -- addTask()', function(done) {
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var inQueueTask = new GithubEventTask(user, githubData, '222', Common.logData);

      var queue = new GithubEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Try to add same user
      var task = new GithubEventTask(user, githubData, null, Common.logData);
      queue.addTask(task, Common.logData);

      // Queue should only have 1 task
      Assert.strictEqual(queue.queue.tasks.length, 1);

      queue.reset();
      done();
    });
  });

  it('should unshift task back onto queue. Task path is defined -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(userInQueue) {

      var queue = new GithubEventQueue(Common.logData);

      var inQueueTask = new GithubEventTask(userInQueue, githubData, null, Common.logData);
      inQueueTask.wait = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Change user _id so the add request is still valid
      var user = JSON.parse(JSON.stringify(userInQueue));
      user._id = '111';

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      task.wait = 1000000;
      task.path = 'defined';

      queue.finishTask(task, Common.logData, function() {
        Assert.strictEqual(queue.taskWaitTime, task.wait);
        Assert.strictEqual(queue.queue.tasks[0].data.user._id, '111');
        Assert.strictEqual(queue.queue.tasks.length, 2);

        queue.reset();
        done();
      });
    });
  });

  it('should push task onto queue. Task path is null and there are no commits -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(userInQueue) {

      var queue = new GithubEventQueue(Common.logData);

      var inQueueTask = new GithubEventTask(userInQueue, githubData, null, Common.logData);
      inQueueTask.wait = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Change user _id so the add request is still valid
      var user = JSON.parse(JSON.stringify(userInQueue));
      user._id = '111';

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      task.wait = 1000000;
      task.path = null;

      queue.finishTask(task, Common.logData, function() {
        Assert.strictEqual(task.wait, 0); // task.wait is to reset to 0
        Assert.strictEqual(queue.taskWaitTime, 1000000);
        Assert.strictEqual(queue.queue.tasks[1].data.user._id, '111');
        Assert.strictEqual(queue.queue.tasks.length, 2);

        queue.reset();
        done();
      });
    });
  });

  it('should push task onto queue. Task path is null and task contains commits -- finishTask()', function(done) {

    User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {

      // Get user's Github baseline experience
      var baselineExperience = user.subSkills[8].experience;

      var queue = new GithubEventQueue(Common.logData);

      // Change user _id so the add request is still valid
      var userInQueue = JSON.parse(JSON.stringify(user));
      userInQueue._id = '111';

      var inQueueTask = new GithubEventTask(userInQueue, githubData, null, Common.logData);
      inQueueTask.wait = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      task.wait = 1000000;
      task.path = null;

      GithubInterfaceService.getCommits(user, GithubData.USER_GITHUB.accessToken, null, 1, null, Common.logData, function (result) {
        task.commits = task.commits.concat(result.commits);

        // Sum up commits experience
        var sum = 0;
        for(var i = 0; i < task.commits.length; i++) {
          sum += parseInt(task.commits[i].experience);
        }

        var newExperience = baselineExperience + sum;

        queue.finishTask(task, Common.logData, function() {
          User.getUserWithUsername(Common.USER.username, Common.logData, function (updatedUser) {

            Assert.strictEqual(updatedUser.subSkills[8].experience, newExperience);
            Assert.strictEqual(task.wait, 0); // task.wait is to reset to 0
            Assert.strictEqual(queue.taskWaitTime, 1000000);
            Assert.strictEqual(queue.currentTask.user._id, '111');
            Assert.strictEqual(queue.queue.tasks[0].data.user._id, user._id);
            Assert.strictEqual(queue.queue.tasks.length, 1);

            queue.reset();
            done();
          });
        });
      });
    });
  });

  it('should prepare task for execution -- prepareTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var task = new GithubEventTask(user, githubData, null, Common.logData);
      var queue = new GithubEventQueue(Common.logData);
      queue.taskWaitTime = 10;

      // Test 1 - if task.isPoll is false then don't set taskWaitTime to pollTime
      queue.prepareTask(task);
      Assert.strictEqual(10, queue.taskWaitTime);

      // Test 2 - if task.isPoll is true then set taskWaitTime to pollTime
      task.isPoll = true;
      queue.prepareTask(task);
      Assert.strictEqual(queue.taskWaitTime, queue.getPollTime());

      done();
    });
  });
