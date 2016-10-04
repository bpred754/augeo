
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
  /*              interface-service/github-interface-service                 */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var Common = require('../../data/common');
  var GithubData = require('../../data/github-data');
  var GithubInterfaceService = require('../../../src/interface-service/github-interface-service');

  it('should get access tokens from Github -- getAccessToken()', function(done) {

    // Invalid code
    GithubInterfaceService.getAccessToken("failAccessToken", Common.logData, function(invalid) {
      Assert.strictEqual(invalid, '');

      // Valid
      GithubInterfaceService.getAccessToken("test-code", Common.logData, function(accessToken) {
        Assert.strictEqual(accessToken, "11111");
        done();
      });
    });
  });

  it('should return extracted commits and other relevant information for concurrent getCommits requests -- getCommits()', function(done) {

    // Request returns status 304 - not modified therefore the result contains no new commits
    GithubInterfaceService.getCommits(Common.USER, 'accessToken', 'path', '0', '00001', Common.logData, function(notModifiedResult) {
      Assert.strictEqual(notModifiedResult.commits.length, 0);
      Assert.strictEqual(notModifiedResult.eTag, '0');
      Assert.strictEqual(notModifiedResult.poll, 60000);
      notModifiedResult.wait.should.be.belowOrEqual(60100);
      Should.not.exist(notModifiedResult.path);

      // Request returns 200 with commits - does not use lastEventId
      GithubInterfaceService.getCommits(Common.USER, 'accessToken', 'path', '1', null, Common.logData, function(withNoEventId) {
        Assert.strictEqual(withNoEventId.commits.length, 4);
        Assert.strictEqual(withNoEventId.eTag, '1');
        Assert.strictEqual(withNoEventId.poll, 60000);
        withNoEventId.wait.should.be.belowOrEqual(60100);
        Assert.strictEqual(withNoEventId.path, '/next');

        // Request returns 200 with no commits since commit stats could not be retrieved
        GithubInterfaceService.getCommits(Common.USER, 'invalid', 'path', '1', '1', Common.logData, function(withInvalidCommitRequest) {
          Assert.strictEqual(withInvalidCommitRequest.commits.length, 0);

          // Request returns 200 with commits - uses lastEventId
          GithubInterfaceService.getCommits(Common.USER, 'accessToken', 'path', '1', '1', Common.logData, function(withEventId) {
            Assert.strictEqual(withEventId.commits.length, 2);
            Assert.strictEqual(withEventId.eTag, '1');
            Assert.strictEqual(withEventId.poll, 60000);
            withEventId.wait.should.be.belowOrEqual(60100);
            Assert.strictEqual(withEventId.path, null);
            Assert.strictEqual(parseInt(withEventId.commits[0].additions), 20);
            Assert.strictEqual(parseInt(withEventId.commits[0].deletions), 10);
            done();
          });
        });
      });
    });
  });

  it ('should get Github user data from Github -- getUserData()', function(done) {

    // Invalid access token
    GithubInterfaceService.getUserData('failUserData', Common.logData, function(invalid) {
      invalid.should.be.empty();

      // Valid
      GithubInterfaceService.getUserData("valid", Common.logData, function(userData) {
        Assert.strictEqual(userData.accessToken, "valid");
        Assert.strictEqual(userData.githubId, GithubData.USER_GITHUB.githubId);
        Assert.strictEqual(userData.name, Common.USER.firstName);
        Assert.strictEqual(userData.profileImageUrl, GithubData.USER_GITHUB.profileImageUrl);
        Assert.strictEqual(userData.screenName, GithubData.USER_GITHUB.screenName);
        done();
      })
    });
  });
