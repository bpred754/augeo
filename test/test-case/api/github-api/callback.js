
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
  /* Description: Unit test cases for api/github-api 'callback' requests     */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../../src/model/database');
  var Common = require('../../../data/common');
  var GithubData = require('../../../data/github-data');

  // Global variables
  var GithubUser = AugeoDB.model('GITHUB_USER');
  var User = AugeoDB.model('AUGEO_USER');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid session
    it('should return status 401 due to invalid session -- callback()', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/github-api/callback')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Missing code attribute
    it('should return status 400 due to missing code attribute -- callback()', function(done) {

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .get('/github-api/callback?state=' + process.env.GITHUB_STATE)
            .expect(400)
            .end(function(error1, response1) {
              Should.not.exist(error1);
              Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');
              done();
            });
        });
    });

    // Missing state attribute
    it('should return status 400 due to missing state attribute -- callback()', function(done) {

      agent
        .get('/github-api/callback?code=1001')
        .expect(400)
        .end(function(error1, response1) {
          Should.not.exist(error1);
          Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Failed to retrieve access token
    it('should return status 400 failed to retrieve access token -- callback()', function(done) {

      agent
        .get('/github-api/callback?code=failAccessToken&state=' + process.env.GITHUB_STATE)
        .expect(400)
        .end(function(error1, response1) {
          Should.not.exist(error1);
          Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Failed to retrieve Github user data
    it('should return status 400 failed to retrieve Github user data -- callback()', function(done) {

      agent
        .get('/github-api/callback?code=failUserData&state=' + process.env.GITHUB_STATE)
        .expect(400)
        .end(function(error1, response1) {
          Should.not.exist(error1);
          Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Github screen name already exists
    it('should return status 400 screen name already exists -- callback()', function(done) {

      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        // Add Github user to collection
        var githubUser = {
          augeoUser: user._id,
          githubId: GithubData.USER_GITHUB.githubId,
          accessToken: GithubData.USER_GITHUB.accessToken,
          screenName: GithubData.USER_GITHUB.screenName,
          profileImageUrl: GithubData.USER_GITHUB.profileImageUrl
        };

        GithubUser.add(Common.USER.username, githubUser, Common.logData, function() {

          // Verify Github user was added
          GithubUser.getUserWithScreenName(githubUser.screenName, Common.logData, function(addedUser) {
            Assert.strictEqual(addedUser.githubId, githubUser.githubId);

            agent
              .get('/github-api/callback?code=1001&state=' + process.env.GITHUB_STATE)
              .expect(400)
              .end(function(error1, response1) {
                Should.not.exist(error1);
                Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');

                // Clean up - remove Github user from GITHUB_USER collection
                GithubUser.remove(addedUser._id, Common.logData, function() {

                  // Verify user was removed
                  GithubUser.getUserWithScreenName(githubUser.screenName, Common.logData, function(removedUser) {
                    Should.not.exist(removedUser);

                    done();
                  });
                });
              });
          });
        });
      });
    });

    // Valid
    it('should return status 200 successful callback from Github -- callback()', function(done) {

      agent
        .get('/github-api/callback?code=1001&state=' + process.env.GITHUB_STATE)
        .expect(302)
        .end(function(error1, response1) {
          Should.not.exist(error1);

          // Verify user in AUGEO_USER collection was updated with Github information
          User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
            Should.exist(user.github.githubId);

            // Verify user was added to GITHUB_USER collection
            GithubUser.getUserWithScreenName(GithubData.USER_GITHUB.screenName, Common.logData, function(githubUser) {
              Assert.strictEqual(githubUser.augeoUser.toString(), user._id.toString());
              done();
            });
          });
        });
    });
  };