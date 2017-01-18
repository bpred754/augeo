
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
  /* Description: Unit test cases for service/activity-service tests         */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Mongoose = require('mongoose');

  // Required local modules
  var Common = require('../../data/common');
  var ActivityService = require('../../../src/service/activity-service');
  var AugeoDB = require('../../../src/model/database');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var User = AugeoDB.model('AUGEO_USER');

  it('should return an activity for a given activity ID -- getActivity()', function(done) {

    // Null activityId
    ActivityService.getActivity(null, Common.logData, function() {}, function() {

      // Invalid ObjectId
      ActivityService.getActivity('invalid', Common.logData, function(){}, function() {
        // Valid
        ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'Augeo', new Date(8640000000000000), Common.logData, function (data0) {

          var referenceActivity = data0.activity[0]
          var activityId = referenceActivity._id;

          ActivityService.getActivity(activityId, Common.logData, function(activity2) {
            Assert.strictEqual(activity2._id.toString(), activityId.toString());
            Assert.strictEqual(activity2.experience, referenceActivity.experience);
            done();
          }, function(){});
        });
      });
    });
  });

  // getSkillActivity
  it('should return skill activity for a user username, skill, and tweetId -- getSkillActivity()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid username
    ActivityService.getSkillActivity('', Common.USER.username, 'Augeo', null, Common.logData, function(){}, function() {

      // Invalid skills
      ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'invalidSkill', null, Common.logData, function(){}, function() {

        // Invalid max timestamp
        ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'Augeo', 'invalid', Common.logData, function(){}, function() {

          // Valid input - no max
          ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'Augeo', new Date(8640000000000000), Common.logData, function (data0) {
            Assert.ok(data0.activity);
            data0.activity.length.should.be.above(0);
            var maxTimestamp = data0.activity[0].timestamp;

            // Valid input - max tweet ID
            ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'Augeo', maxTimestamp, Common.logData, function (data1) {
              Assert.ok(data1.activity);
              data1.activity.length.should.be.above(0);
              Assert.notStrictEqual(data1.activity[0].timestamp, maxTimestamp);
              done();
            }, function () {
            });
          }, function () {
          });
        });
      });
    });
  });

  // removeActivities
  it('should remove a users activities from the ACTIVITY collection', function(done) {

    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      // Add activity to ACTIVITY collection
      var activity = {
        "data": Mongoose.Types.ObjectId("57f0472466afca92698d6e19"),
        "user": user._id,
        "timestamp": new Date("2014-08-13T17:55:11-0700"),
        "kind": "TWITTER_TWEET",
        "experience": 30,
        "classificationGlyphicon": "glyphicon-globe",
        "classification": "General"
      };

      Activity.addActivity(activity, Common.logData, function() {

        // Verify user has activities in ACTIVITY collection
        Activity.getUserActivities(user._id, Common.logData, function(beforeActivities0) {
          beforeActivities0.length.should.be.above(0);

          // Invalid userId
          ActivityService.removeActivities('!!!', Common.logData, function() {}, function(code, message) {
            Assert.strictEqual(code, 400);

            // Verify activities are still there
            Activity.getUserActivities(user._id, Common.logData, function(beforeActivities1) {
              beforeActivities1.length.should.be.above(0);

              // Success
              ActivityService.removeActivities(user._id, Common.logData, function() {

                Activity.getUserActivities(user._id, Common.logData, function(afterActivities) {
                  Assert.strictEqual(afterActivities.length, 0);

                  done();
                });
              });
            });
          });
        });
      });
    });
  });
