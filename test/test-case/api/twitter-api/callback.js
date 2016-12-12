
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
  /* Description: Unit test cases for api/twitter-api 'callback' requests    */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Fails on twitterService.getUserSecretToken
    it('should return status 302 - invalid user in session', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/twitter-api/callback')
        .expect(302)
        .end(function(error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.headers.location, process.env.AUGEO_HOME + '/signup/error');
          done();
        });
    });

    // Fails on twitterInterfaceService.getOAuthAccessToken
    it('should return status 302 - request does not contain query', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          // Set oauth request token
          agent
            .get('/twitter-api/getAuthenticationData')
            .expect(200)
            .end(function(error1, response1) {
              Should.not.exist(error1);
              response1.body.should.have.property('token');

              // Hit callback with no query params
              agent
                .get('/twitter-api/callback')
                .expect(302)
                .end(function(error2, response2) {
                  Should.not.exist(error2);
                  Assert.strictEqual(response2.headers.location, process.env.AUGEO_HOME + '/signup/error');
                  done();
                });
            });
        });
    });

    // Success
    it('should return status 302 - updates user info with twitter, adds user to rest and stream queues', function(done) {
      this.timeout(Common.TIMEOUT);

      // Set oauth request token
      agent
        .get('/twitter-api/getAuthenticationData')
        .expect(200)
        .end(function(error1, response1) {
          Should.not.exist(error1);
          response1.body.should.have.property('token');

          // Hit callback with query params
          agent
            .get('/twitter-api/callback?oauth_token=999&oauth_verifier=999')
            .expect(302)
            .end(function(error2, response2) {
              Should.not.exist(error2);
              Assert.strictEqual(response2.headers.location, process.env.AUGEO_HOME + '/interfaceHistory');
              done();
            });
        });
      });
    };
