
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
  /* Description: Unit test cases for queue-task/augeo-reclassify-task       */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../../src/model/database');
  var AugeoUtility = require('../../../../src/utility/augeo-utility');
  var ReclassifyTask = require('../../../../src/queue-task/augeo/reclassify-task');
  var Common = require('../../../data/common');
  var FitbitData = require('../../../data/fitbit-data');
  var FitbitService = require('../../../../src/service/fitbit-service');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var AugeoUser = AugeoDB.model('AUGEO_USER');
  var Flag = AugeoDB.model('AUGEO_FLAG');
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');

  it('should do nothing when there are no staged flags -- execute()', function(done) {

    var date = AugeoUtility.calculateReclassifyDate(Date.now(), 0, Common.logData);

    StagedFlag.getStagedFlags(date, Common.logData, function(stagedFlagsBefore) {
      Assert.strictEqual(stagedFlagsBefore.length, 0);

      var reclassifyTask = new ReclassifyTask(Common.logData);
      reclassifyTask.executeDate = date;
      reclassifyTask.execute(Common.logData, function() {

        StagedFlag.getStagedFlags(date, Common.logData, function(stagedFlagsAfter) {
          Assert.strictEqual(stagedFlagsAfter.length, 0);
          done();
        });
      });
    });
  });

  it('should reclassify activity if there are enough votes -- execute()', function(done) {

    // Get Augeo user ID
    AugeoUser.getUserWithUsername(Common.USER.username, Common.logData, function(userInit) {

      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      var daySteps0 = {
        dateTime: yesterday,
        fitbitId: FitbitData.USER_FITBIT.fitbitId,
        name: FitbitData.USER_FITBIT.name,
        screenName: FitbitData.USER_FITBIT.screenName,
        steps: 1500,
        classification: 'Fitness',
        classificationGlyphicon: 'glyphicon-heart',
        experience: 15,
        kind: 'FITBIT_DAY_STEPS',
        timestamp: Date.now(),
        user: userInit._id
      };

      var daySteps1 = {
        dateTime: Date.now(),
        fitbitId: FitbitData.USER_FITBIT.fitbitId,
        name: FitbitData.USER_FITBIT.name,
        screenName: FitbitData.USER_FITBIT.screenName,
        steps: 5500,
        classification: 'Fitness',
        classificationGlyphicon: 'glyphicon-heart',
        experience: 55,
        kind: 'FITBIT_DAY_STEPS',
        timestamp: Date.now(),
        user: userInit._id
      };

      var dailySteps = new Array();
      dailySteps.push(daySteps0);
      dailySteps.push(daySteps1);

      // Add Fitbit DayStep activities
      FitbitService.addDailySteps(dailySteps, Common.logData, function(activities) {

        // Get user's initial experience (main and subskills)
        AugeoUser.getUserWithUsername(Common.USER.username, Common.logData, function(userBefore) {
          var augeoExperienceBefore = userBefore.skill.experience;
          var fitnessExperienceBefore = userBefore.subSkills[AugeoUtility.getSkillIndex(daySteps0.classification, Common.logData)].experience;
          var communityExperienceBefore = userBefore.subSkills[AugeoUtility.getSkillIndex('Community', Common.logData)].experience;
          var generalExperienceBefore = userBefore.subSkills[AugeoUtility.getSkillIndex('General', Common.logData)].experience;

          // Create staged flags with the activity ids where one has enough votes to get reclassified
          var reclassifyDate = AugeoUtility.calculateReclassifyDate(Date.now(), 0, Common.logData);

          var stagedFlag0 = {
            activityId: activities[0]._id,
            currentClassification: daySteps0.classification,
            reclassifyDate: reclassifyDate,
            suggestedClassification: 'General',
            timestamp: Date.now(),
            username: Common.USER.username,
            votes: 1
          };

          var stagedFlag1 = {
            activityId: activities[1]._id,
            currentClassification: daySteps1.classification,
            reclassifyDate: reclassifyDate,
            suggestedClassification: 'General',
            timestamp: Date.now(),
            username: Common.USER.username,
            votes: 100
          };

          StagedFlag.addVotes(stagedFlag0, Common.logData, function(updatedFla0) {
            StagedFlag.addVotes(stagedFlag1, Common.logData, function(updatedFlag1) {

              // Verify staged flags are in database
              StagedFlag.getStagedFlags(reclassifyDate, Common.logData, function(stagedFlags) {
                Assert.strictEqual(stagedFlags.length, 2);

                // Call execute
                var reclassifyTask = new ReclassifyTask(Common.logData);
                reclassifyTask.executeDate = reclassifyTask;
                reclassifyTask.execute(Common.logData, function(finishedTask) {

                  // Verify AUGEO_FLAGs were added to the database
                  Flag.getFlags(reclassifyDate, Common.logData, function(flags) {
                    Assert.strictEqual(flags.length, 1);

                    // Verify the first activity's classification did not change
                    Activity.getActivity(userBefore._id, activities[0].data, Common.logData, function(updatedActivity0) {
                      Assert.strictEqual(updatedActivity0.classification, stagedFlag0.currentClassification);

                      // Verify the second activity's classification changed
                      Activity.getActivity(userBefore._id, activities[1].data, Common.logData, function(updatedActivity1) {
                        Assert.strictEqual(updatedActivity1.classification, stagedFlag1.suggestedClassification);

                        AugeoUser.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
                          var augeoExperienceAfter = userAfter.skill.experience;
                          var fitnessExperienceAfter = userAfter.subSkills[AugeoUtility.getSkillIndex('Fitness', Common.logData)].experience;
                          var communityExperienceAfter = userAfter.subSkills[AugeoUtility.getSkillIndex('Community', Common.logData)].experience;
                          var generalExperienceAfter = userAfter.subSkills[AugeoUtility.getSkillIndex('General', Common.logData)].experience;

                          // Verify main skill increased
                          Assert.strictEqual(augeoExperienceAfter - augeoExperienceBefore, 10);

                          // Verify previous subskill experience decreased
                          Assert.strictEqual(fitnessExperienceAfter - fitnessExperienceBefore, -55);

                          // Verify new subskill experience increased
                          Assert.strictEqual(generalExperienceAfter - generalExperienceBefore, 55);

                          // Verify community skill increased
                          Assert.strictEqual(communityExperienceAfter - communityExperienceBefore, 10);

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
  });