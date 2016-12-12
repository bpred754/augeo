
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
  /* Description: Unit test cases for queue/fitbit-event-queue               */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../../data/common');
  var FitbitData = require('../../data/fitbit-data');
  var FitbitEventQueue = require('../../../src/queue/fitbit-event-queue');
  var FitbitEventTask = require('../../../src/queue-task/fitbit/fitbit-event-task');

  // Global variables
  var FitbitUser = AugeoDB.model('FITBIT_USER');
  var User = AugeoDB.model('AUGEO_USER');
  var fitbitData = {
    fitbitId: FitbitData.USER_FITBIT.fitbitId,
    accessToken: FitbitData.USER_FITBIT.accessToken,
    name: FitbitData.USER_FITBIT.name,
    screenName: FitbitData.USER_FITBIT.screenName,
    profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl,
    refreshToken: FitbitData.USER_FITBIT.accessToken
  };

  it('should add all Fitbit users to queue -- addAllUsers()', function(done) {

    FitbitUser.getAllUsers(Common.logData, function(users) {
      var numberUsers = users.length;

      var queue = new FitbitEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addAllUsers(Common.logData, function() {
        Assert.strictEqual(queue.queue.tasks.length, numberUsers);
        done();
      });
    });
  });

  it('should push task onto queue since add request is valid -- addTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(userInQueue) {

      var inQueueTask = new FitbitEventTask(userInQueue, fitbitData, null, Common.logData);

      var queue = new FitbitEventQueue(Common.logData);
      queue.taskWaitTime = 1000000;
      queue.addTask(inQueueTask, Common.logData);

      // Change user _id so the add request is still valid
      var user = JSON.parse(JSON.stringify(userInQueue));
      user._id = '111';

      var task = new FitbitEventTask(user, fitbitData, null, Common.logData);
      queue.addTask(task, Common.logData);

      // Second task should have updated user _id
      Assert.strictEqual(queue.queue.tasks[1].data.user._id, '111');
      queue.kill();
      done();
    });
  });

  it('should not update players experience and rank since there are no daily tasks -- finishTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var initialExperience = user.skill.experience;

      var task = new FitbitEventTask(user, fitbitData, null, Common.logData);
      var queue = new FitbitEventQueue(Common.logData);
      queue.finishTask(task, Common.logData, function() {

        User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
          var userAfterExperience = userAfter.skill.experience;

          Assert.strictEqual(initialExperience, userAfterExperience);
          queue.kill();
          done();
        });
      });
    });
  });

  it('should update users experience with experience from daily-steps -- finishTask()', function(done) {
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
      var initialExperience = user.skill.experience;

      // Set fitbit data
      fitbitData.augeoUser = user._id;

      var task = new FitbitEventTask(user, fitbitData, null, Common.logData);
      task.execute(Common.logData, function(updatedTask) {
        var queue = new FitbitEventQueue(Common.logData);
        queue.finishTask(task, Common.logData, function() {

          User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
            var userAfterExperience = userAfter.skill.experience;
            userAfterExperience.should.be.above(initialExperience);
            done();
          });
        });
      });
    });
  });

  it('should do nothing since it is not the first task in the queue -- prepareTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      // Set fitbit data
      fitbitData.augeoUser = user._id;

      var task = new FitbitEventTask(user, fitbitData, null, Common.logData);
      task.isFirstRequestInQueue = false;
      var queue = new FitbitEventQueue(Common.logData);
      queue.prepareTask(task, Common.logData);

      Assert.strictEqual(0, queue.taskWaitTime);
      done();
    });
  });

  it('should set queue wait time since it is the first task in the queue -- prepareTask()', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      // Set fitbit data
      fitbitData.augeoUser = user._id;

      var task = new FitbitEventTask(user, fitbitData, null, Common.logData);
      task.isFirstRequestInQueue = true;
      var queue = new FitbitEventQueue(Common.logData);
      queue.prepareTask(task, Common.logData);

      Assert.strictEqual(300000, queue.taskWaitTime);
      done();
    });
  });