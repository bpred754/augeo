
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