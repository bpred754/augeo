
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
  /* Description: Unit test cases for dependent service/user-service tests   */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var Common = require('../../data/common');
  var UserService = require('../../../src/service/user-service');

  // getDashboardDisplayData
  it('should return dashboard display data -- getDashboardDisplayData()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Valid targetUsername
    UserService.getDashboardDisplayData(Common.USER.username, Common.logData, function(data0) {

      Assert.ok(data0.user);
      Assert.ok(data0.user.profileImg);
      Assert.ok(data0.user.skill);
      Assert.ok(data0.user.subSkills);
      Assert.ok(data0.recentActions);
      data0.recentActions.length.should.be.above(0);

      // Invalid target
      UserService.getDashboardDisplayData('username', Common.logData, function(data1){
        Assert.strictEqual(data1.errorImageUrl, 'image/avatar-medium.png');
        done();
      }, function(){});
    }, function(){});
  });

  // getSkillActivity
  it('should return skill activity for a user username, skill, and tweetId -- getSkillActivity()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid username
    UserService.getSkillActivity('', 'Augeo', null, Common.logData, function(){}, function() {

      // Invalid skills
      UserService.getSkillActivity(Common.USER.username, 'invalidSkill', null, Common.logData, function(){}, function() {

        // Invalid max timestamp
        UserService.getSkillActivity(Common.USER.username, 'Augeo', 'invalid', Common.logData, function(){}, function() {

          // Valid input - no max
          UserService.getSkillActivity(Common.USER.username, 'Augeo', new Date(8640000000000000), Common.logData, function (data0) {
            Assert.ok(data0.activity);
            data0.activity.length.should.be.above(0);
            var maxTimestamp = data0.activity[0].timestamp;

            // Valid input - max tweet ID
            UserService.getSkillActivity(Common.USER.username, 'Augeo', maxTimestamp, Common.logData, function (data1) {
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
