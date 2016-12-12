
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
  /* Description: Unit test cases for service/fitbit-service                 */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../../data/common');
  var FitbitData = require('../../data/fitbit-data');
  var FitbitInterfaceService = require('../../../src/interface-service/fitbit-interface-service');
  var FitbitService = require('../../../src/service/fitbit-service');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var DaySteps = AugeoDB.model('FITBIT_DAY_STEPS');
  var User = AugeoDB.model('AUGEO_USER');
  var FitbitUser = AugeoDB.model('FITBIT_USER');

  it('should add day-steps to the FITBIT_DAY_STEPS collection -- addDailySteps()', function(done) {

    // Get initial count of day-steps in FITBIT_DAY_STEPS collection
    DaySteps.getDayStepsCount(Common.logData, function(initialDayStepsCount) {

      // Try to add empty array of day-steps
      FitbitService.addDailySteps(new Array(), Common.logData, function() {

        // Get count of day-steps in FITBIT_DAY_STEPS collection to verify none were added
        DaySteps.getDayStepsCount(Common.logData, function(noneAddedCount) {
          Assert.strictEqual(noneAddedCount, initialDayStepsCount);

          // Get augeo userId for USER and initial experience
          User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {
            var initialExperience = user.skill.experience;

            var fitbitUser = {
              augeoUser: user._id,
              fitbitId: FitbitData.USER_FITBIT.fitbitId,
              accessToken: FitbitData.USER_FITBIT.accessToken,
              name: FitbitData.USER_FITBIT.name,
              profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl
            };

            // Use interface service to get extracted day-steps
            FitbitInterfaceService.getSteps(fitbitUser, '1d', Common.logData, function(result) {
              Assert.strictEqual(result.length, 2);

              // Add day-steps
              FitbitService.addDailySteps(result, Common.logData, function() {

                // Verify day-steps count
                DaySteps.getDayStepsCount(Common.logData, function(afterAddCount) {
                  Assert.strictEqual(afterAddCount, initialDayStepsCount + 2);

                  // Verify day-steps are in FITBIT_DAY_STEPS collection
                  DaySteps.getLatestDaySteps(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(latestDayStep) {
                    Assert.equal(latestDayStep.steps, result[result.length-1].steps);

                    // Verify day-steps are in ACTIVITY collection
                    Activity.getActivity(user._id, latestDayStep._id, Common.logData, function(activity) {
                      Should.exist(activity);

                      // Sum up new day-steps experience
                      var sum = 0;
                      for(var i = 0; i < result.length; i++) {
                        sum += parseInt(result[i].experience);
                      }

                      // Verify user's overall experience increased
                      User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
                        Assert.strictEqual(userAfter.skill.experience, initialExperience + sum);
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should add a Fitbit user to the FITBIT_USER collection -- addUser()', function(done) {

    FitbitService.addUser(Common.USER.username, FitbitData.USER_FITBIT, Common.logData, function(){}, function(message0) {
      Assert.strictEqual(message0, 'Invalid Fitbit user');

      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        var missingFitbitId = {
          augeoUser: user._id,
          accessToken: FitbitData.USER_FITBIT.accessToken,
          name: FitbitData.USER_FITBIT.name
        };

        FitbitService.addUser(Common.USER.username, missingFitbitId, Common.logData, function(){}, function(message1) {
          Assert.strictEqual(message1, 'Invalid Fitbit user');

          var missingAccessToken = {
            augeoUser: user._id,
            fitbitId: FitbitData.USER_FITBIT.fitbitId,
            name: FitbitData.USER_FITBIT.name
          };

          FitbitService.addUser(Common.USER.username, missingAccessToken, Common.logData, function(){}, function(message3) {
            Assert.strictEqual(message3, 'Invalid Fitbit user');

            var valid = {
              augeoUser: user._id,
              fitbitId: FitbitData.USER_FITBIT.fitbitId,
              accessToken: FitbitData.USER_FITBIT.accessToken,
              name: FitbitData.USER_FITBIT.name
            };

            FitbitService.addUser(Common.USER.username, valid, Common.logData, function(){
              User.getUserWithUsername(Common.USER.username, Common.logData, function(updatedUser) {
                Assert.strictEqual(updatedUser.fitbit.fitbitId, FitbitData.USER_FITBIT.fitbitId);
                Assert.strictEqual(updatedUser.fitbit.name, FitbitData.USER_FITBIT.name);
                done();
              });
            }, function(){});
          });
        });
      });
    });
  });

  it('should check if the specified Fitbit ID exists in the FITBIT_USER collection -- checkExistingFitbitId()', function(done) {

    // Fitbit ID that doesn't exist
    var fitbitId0 = 'doesntExist';
    FitbitService.checkExistingFitbitId(fitbitId0, Common.logData, function(doesExist0) {
      Assert.strictEqual(doesExist0, false);

      // Valid existing screen name
      FitbitService.checkExistingFitbitId(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(doesExist1) {
        Assert.strictEqual(doesExist1, true);
        done();
      });
    });
  });

  it('should get the last day-step date time -- getLastDateTime()', function(done) {

    // Get latest day-step date time
    FitbitService.getLastDateTime(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(initialDateTime) {

      User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {

        var fitbitUser = {
          augeoUser: user._id,
          fitbitId: FitbitData.USER_FITBIT.fitbitId,
          accessToken: FitbitData.USER_FITBIT.accessToken,
          name: FitbitData.USER_FITBIT.name,
          profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl
        };

        FitbitInterfaceService.getSteps(fitbitUser, '1d', Common.logData, function(result) {

          var daySteps = new Array();
          var dayStep = result[0];
          dayStep.dateTime = new Date();
          daySteps.push(dayStep);

          // Add day-step
          FitbitService.addDailySteps(daySteps, Common.logData, function() {

            // Get latest date time and verify it matches the added day-step's date time
            FitbitService.getLastDateTime(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(lastDateTime) {
              initialDateTime.should.not.be.eql(lastDateTime);
              lastDateTime.should.be.above(initialDateTime);
              done();
            });
          });
        });
      });
    });
  });

  // loopThroughUsersQueueData
  it('should loop through all users queue data and execute a callback for each user -- loopThroughUsersQueueData()', function(done) {

    // Verify there is only one Fitbit user or else done will get called multiple times
    FitbitUser.getAllUsers(Common.logData, function(users) {
      Assert.strictEqual(users.length, 1);

      FitbitService.loopThroughUsersQueueData(Common.logData, function(queueData) {
        Should.exist(queueData.user.fitbitId);
        Should.exist(queueData.lastDateTime);
        done();
      });
    });
  });

  it('should remove Fitbit user from FITBIT_USER collection -- removeUser()', function(done) {

    // Invalid AugeoUser ID
    FitbitService.removeUser(undefined, Common.logData, function () {
    }, function (code, message) {
      Assert.strictEqual(message, 'Invalid AugeoUser ID');

      FitbitUser.getUserWithFitbitId(FitbitData.USER_FITBIT.fitbitId, Common.logData, function (user0) {

        // Valid AugeoUser ID
        FitbitService.removeUser(user0.augeoUser, Common.logData, function (removedUser) {
          Assert.strictEqual(removedUser.fitbitId, FitbitData.USER_FITBIT.fitbitId);

          // Verify Fitbit user is no longer in FITBIT_USER collection
          FitbitUser.getUserWithFitbitId(FitbitData.USER_FITBIT.fitbitId, Common.logData, function (user1) {
            Should.not.exist(user1);

            // Verify AugeoUser no longer has reference to FITBIT_USER
            User.getUserWithUsername(Common.USER.username, Common.logData, function (user2) {
              Should.not.exist(user2.fitbit);
              done();
            });
          });
        });
      });
    });
  });