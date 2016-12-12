
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
  /*   test/test-interface/fitbit-test-interface                             */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var Common = require('../../data/common');
  var FitbitTestInterface = require('../../test-interface/fitbit-test-interface');;

  it('should return a json string with valid auth data -- getAuthData()', function(done) {

    FitbitTestInterface.getAuthData('12345', Common.logData, function(authData) {
      var parsed = JSON.parse(authData);
      Assert.strictEqual("1111", parsed["access_token"]);
      done()
    });
  });

  it('should return a json string with valid history data -- getSteps()', function(done) {

    FitbitTestInterface.getSteps('12345', '1y', Common.logData, function(historyData) {
      var parsed = JSON.parse(historyData);
      Assert.strictEqual(10111, parsed["activities-tracker-steps"][0].value);
      done();
    });
  });

  it('should return a json string with valid user data -- getUserData()', function(done) {

    FitbitTestInterface.getUserData('12345', Common.logData, function(userData) {
      var parsed = JSON.parse(userData);
      Assert.strictEqual("Test Tester", parsed.user.fullName);
      done();
    });
  });

  it('should return a json string with valid refresh data -- refreshAccessToken()', function(done) {

    FitbitTestInterface.refreshAccessToken('12345', Common.logData, function(refreshData) {
      var parsed = JSON.parse(refreshData);
      Assert.strictEqual("Bearer", parsed["token_type"]);
      done();
    });
  });