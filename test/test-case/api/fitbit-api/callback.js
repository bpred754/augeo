
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
  /* Description: Unit test cases for api/fitbit-api 'callback' requests     */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../../src/model/database');
  var Common = require('../../../data/common');
  var FitbitData = require('../../../data/fitbit-data');

  // Global variables
  var FitbitUser = AugeoDB.model('FITBIT_USER');
  var User = AugeoDB.model('AUGEO_USER');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid session
    it('should return status 302 due to invalid session -- callback()', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/fitbit-api/callback')
        .expect(302)
        .end(function(error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Failed to get auth data
    it('should return status 302 due to a failure to retrieve auth data -- callback()', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .get('/fitbit-api/callback?code=1')
            .expect(302)
            .end(function (error, response) {
              Should.not.exist(error);
              Assert.strictEqual(response.headers.location, process.env.AUGEO_HOME + '/signup/error');
              done();
            });
        });
    });

    // Fitbit ID already exists
    it('should return 302 due to an existing Fitbit user -- callback()', function(done) {

      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        // Add Fitbit user to collection
        var fitbitUser = {
          augeoUser: user._id,
          fitbitId: FitbitData.USER_FITBIT.fitbitId,
          accessToken: FitbitData.USER_FITBIT.accessToken,
          name: FitbitData.USER_FITBIT.name,
          screenName: FitbitData.USER_FITBIT.screenName,
          profileImageUrl: FitbitData.USER_FITBIT.profileImageUrl,
          refreshToken: FitbitData.USER_FITBIT.accessToken
        };

        FitbitUser.add(Common.USER.username, fitbitUser, Common.logData, function() {

          // Verify Fitbit user was added
          FitbitUser.getUserWithFitbitId(fitbitUser.fitbitId, Common.logData, function(addedUser) {
            Assert.strictEqual(addedUser.fitbitId, fitbitUser.fitbitId);

            agent
              .get('/fitbit-api/callback?code=1001')
              .expect(302)
              .end(function(error1, response1) {
                Should.not.exist(error1);
                Assert.strictEqual(response1.headers.location, process.env.AUGEO_HOME + '/signup/error');

                // Verify user was removed
                FitbitUser.getUserWithFitbitId(fitbitUser.screenName, Common.logData, function(removedUser) {
                  Should.not.exist(removedUser);
                  done();
                });
              });
          });
        });
      });
    });

    // Failed to retrieve steps
    it('should return status 302 due to error retrieving step history -- callback()', function(done) {

      agent
        .get('/fitbit-api/callback?code=2')
        .expect(302)
        .end(function(error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Valid
    it('should return status 200 successful callback from Fitbit -- callback()', function(done) {

      agent
        .get('/fitbit-api/callback?code=1001')
        .expect(302)
        .end(function(error1, response1) {
          Should.not.exist(error1);

          // Verify user in AUGEO_USER collection was updated with Fitbit information
          User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {
            Should.exist(user.fitbit.fitbitId);

            // Verify user was added to FITBIT_USER collection
            FitbitUser.getUserWithFitbitId(FitbitData.USER_FITBIT.fitbitId, Common.logData, function(fitbitUser) {
              Assert.strictEqual(fitbitUser.augeoUser.toString(), user._id.toString());
              done();
            });
          });
        });
    });
  };