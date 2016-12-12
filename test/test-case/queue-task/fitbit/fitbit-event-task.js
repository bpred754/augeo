
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
  /* Description: Unit test cases for queue-task/fitbit-event-task           */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../../src/model/database');
  var Common = require('../../../data/common');
  var FitbitEventTask = require('../../../../src/queue-task/fitbit/fitbit-event-task');
  var FitbitData = require('../../../data/fitbit-data');
  var UserService = require('../../../../src/service/user-service');

  // Global variables
  var FitbitUser = AugeoDB.model('FITBIT_USER');
  var fitbitData = {
    fitbitId: FitbitData.USER_FITBIT.fitbitId,
    accessToken: FitbitData.USER_FITBIT.accessToken,
    name: FitbitData.USER_FITBIT.name,
    screenName: FitbitData.USER_FITBIT.screenName,
    profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl,
    refreshToken: FitbitData.USER_FITBIT.accessToken
  };

  it('should return a task with "1y" worth of daily steps (3 entries) -- execute()', function(done) {

    // Get augeo user
    UserService.getUserSecret(Common.USER.username, Common.logData, function(userData) {

      // Set fitbit data
      fitbitData.augeoUser = userData._id;

      var task = new FitbitEventTask(userData, fitbitData, null, Common.logData);
      task.execute(Common.logData, function(data) {
        Assert.strictEqual(data.dailySteps.length, 3);
        done();
      });
    });
  });

  it('should return a task with less than "1y" worth of daily steps (2 entries) -- execute()', function(done) {

    // Get augeo user
    UserService.getUserSecret(Common.USER.username, Common.logData, function(userData) {

      // Set fitbit data
      fitbitData.augeoUser = userData._id;

      var dateTime = new Date(2016, 10, 1, 0, 0, 0, 0);
      var task = new FitbitEventTask(userData, fitbitData, dateTime, Common.logData);
      task.execute(Common.logData, function(data) {
        Assert.strictEqual(data.dailySteps.length, 2);
        done();
      });
    });
  });

  it('should return a task with an empty daily steps array due to expired access tokens -- execute()', function(done) {

    // Get augeo user
    UserService.getUserSecret(Common.USER.username, Common.logData, function(userData) {

      // Set fitbit data
      fitbitData.augeoUser = userData._id;
      fitbitData.accessToken = '0';

      var task = new FitbitEventTask(userData, fitbitData, null, Common.logData);
      task.execute(Common.logData, function(data) {
        Assert.strictEqual(data.dailySteps.length, 0);

        // Check to make sure access tokens were updated
        FitbitUser.getUserWithFitbitId(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(fitbitUser) {
          Assert.strictEqual('c643a63c072f0f05478e9d18b991db80ef6061e4f8e6c822d83fed53e5fafdd7', fitbitUser.refreshToken);
          done();
        });
      });
    });
  });

  it('should return a task with an empty daily steps array due to error -- execute()', function(done) {

    // Get augeo user
    UserService.getUserSecret(Common.USER.username, Common.logData, function(userData) {

      // Set fitbit data
      fitbitData.augeoUser = userData._id;
      fitbitData.accessToken = '1';

      var task = new FitbitEventTask(userData, fitbitData, null, Common.logData);
      task.execute(Common.logData, function(data) {
        Assert.strictEqual(data.dailySteps.length, 0);
        done();
      });
    });
  });

  it('should do nothing when the task has no daily steps -- reset', function(done) {

    var task = new FitbitEventTask({}, {}, null, Common.logData);
    Assert.strictEqual(task.dailySteps.length, 0);

    task.reset();
    Assert.strictEqual(task.dailySteps.length, 0);
    done();
  });

  it('should empty the daily steps and reset the last date time -- reset()', function(done) {

    // Get augeo user
    UserService.getUserSecret(Common.USER.username, Common.logData, function(userData) {

      // Set fitbit data
      fitbitData.augeoUser = userData._id;
      fitbitData.accessToken = FitbitData.USER_FITBIT.accessToken

      // Fill task with daily steps data
      var task = new FitbitEventTask(userData, fitbitData, null, Common.logData);
      task.execute(Common.logData, function(data) {
        Assert.strictEqual(task.dailySteps.length, 3);

        task.reset();
        Assert.strictEqual(task.dailySteps.length, 0);
        Assert.strictEqual(task.lastDateTime, 'Sat Dec 10 2016 17:38:19 GMT-0700 (MST)');

        done();
      });
    });
  });