
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
  /* Description: Unit test cases for api/twitter-api 'setMember' requests   */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');
  var TwitterService = require('../../../../src/service/twitter-service');
  var AugeoDB = require('../../../../src/model/database');

  // Global variables
  var User = AugeoDB.model('User');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Screen name does not exist in session
    it('should return status 400 - invalid screen name in session', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/twitter-api/setMember')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 200 - valid', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);

          // Verify user is not a member
          User.getUserWithEmail(Common.USER.email, function(user) {
            TwitterService.isMember(user._id + '', function(isMemberBefore) {
              Assert.strictEqual(isMemberBefore,  false);

              agent
                .post('/twitter-api/setMember')
                .expect(200)
                .end(function(error, response) {
                  Should.not.exist(error);

                  // Verify user is a member
                  TwitterService.isMember(user._id + '', function(isMemberAfter) {
                    Assert.strictEqual(isMemberAfter,  true);
                      done();
                  });
                });
            });
          });
        });
    });
  };
