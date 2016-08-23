
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
  /*   test/test-interface/github-test-interface                             */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var Common = require('../common');
  var GithubTestInterface = require('../../test-interface/github-test-interface');

  it('should return empty token when given "failAccessToken" code param -- getAccessToken()', function(done) {

    GithubTestInterface.getAccessToken('failAccessToken', Common.logData, function(data) {
      Should.not.exist(data);
      done();
    });
  });

  it('should return access token "failUserData" when given code "failUserData" -- getAccessToken()', function(done) {

    GithubTestInterface.getAccessToken('failUserData', Common.logData, function(data) {
      Should.exist(data);

      var json = JSON.parse(data);
      Assert.strictEqual(json.access_token, 'failUserData');
      done();
    });
  });

  it('should return access token 11111 when given a code -- getAccessToken()', function(done) {

    GithubTestInterface.getAccessToken(1001, Common.logData, function(data) {
      Should.exist(data);

      var json = JSON.parse(data);
      Assert.strictEqual(json.access_token, '11111');
      done();
    });
  });

  it('should return empty user data when given "failUserData" access token param -- getUserData()', function(done) {

    GithubTestInterface.getUserData('failUserData', Common.logData, function(data) {
      Should.not.exist(data);
      done();
    });
  });

  it('should return userData when given an access token -- getUserData()', function(done) {

    GithubTestInterface.getUserData('11111', Common.logData, function(data) {
      Should.exist(data);

      var json = JSON.parse(data);
      Assert.strictEqual(json.id, Common.USER_GITHUB.githubId);
      Assert.strictEqual(json.name, Common.USER.firstName);
      Assert.strictEqual(json.avatarUrl, Common.USER_GITHUB.profileImageUrl);
      Assert.strictEqual(json.login, Common.USER_GITHUB.screenName);
      done();
    });
  });
