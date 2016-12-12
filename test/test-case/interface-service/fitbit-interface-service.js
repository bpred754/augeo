
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
  /* Description: Unit test cases for                                        */
  /*              interface-service/fitbit-interface-service                 */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var Common = require('../../data/common');
  var FitbitInterfaceService = require('../../../src/interface-service/fitbit-interface-service');

  it('should return nothing with invalid code -- getAuthData()', function(done) {
    FitbitInterfaceService.getAuthData('1', Common.logData, function(accessToken, refreshToken, userId) {
      Should.not.exist(accessToken);
      Should.not.exist(refreshToken);
      Should.not.exist(userId);
      done();
    });
  });

  it('should return parsed auth data -- getAuthData()', function(done) {
    FitbitInterfaceService.getAuthData('12345', Common.logData, function(accessToken, refreshToken, userId) {
      Should.exist(accessToken);
      Should.exist(refreshToken);
      Should.exist(userId);
      done();
    });
  });

  it('should return empty array with invalid request  -- getSteps()', function(done) {

    FitbitInterfaceService.getSteps({"accessToken":"1"}, '1d', Common.logData, function(steps) {
      Should.not.exist(steps);
      done();
    });
  });

  it('should return an error string with invalid access token  -- getSteps()', function(done) {

    FitbitInterfaceService.getSteps({"accessToken":"2"}, '1d', Common.logData, function(steps) {
      Assert.strictEqual('invalid access token', steps);
      done();
    });
  });

  it('should return parsed history data -- getSteps()', function(done) {

    var fitbitUser = {
      accessToken:"12345",
      name: "Test Tester",
      screenName: "testScreenName",
      profileImageUrl: "testProfileImage"
    };

    FitbitInterfaceService.getSteps(fitbitUser, '1d', Common.logData, function(steps) {
      Assert.strictEqual(true, steps instanceof Array);
      Assert.strictEqual(steps[0].steps, 10111);
      done();
    });
  });

  it('should return empty object with invalid access token -- getUserData()', function(done) {
    FitbitInterfaceService.getUserData('1', Common.logData, function(userData) {
      userData.should.be.empty();
      done();
    });
  });

  it('should return parsed user data -- getUserData()', function(done) {
    FitbitInterfaceService.getUserData('12345', Common.logData, function(userData) {
      Assert.strictEqual('Test Tester', userData.name);
      done();
    });
  });

  it('should return nothing with invalid refresh token -- refreshAccessToken()', function(done) {

    FitbitInterfaceService.refreshAccessToken('1', Common.logData, function(refreshData) {
      Should.not.exist(refreshData);
      done();
    });
  });

  it('should return parsed refresh data -- refreshAccessToken()', function(done) {

    FitbitInterfaceService.refreshAccessToken('12345', Common.logData, function(refreshData) {
      Assert.strictEqual('Bearer', refreshData.token_type);
      done();
    });
  });