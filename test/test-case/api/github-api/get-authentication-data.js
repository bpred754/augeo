
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
  /* Description: Unit test cases for api/github-api                         */
  /*              'getAuthenticationData' requests                           */
  /***************************************************************************/

  // Required libraries
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid session
    it('should return status 401 invalid user in session -- getAuthenticationData()', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/github-api/getAuthenticationData')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Valid
    it('should return status 200 valid user and session -- getAuthenticationData()', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login user
      agent
        .post('/user-api/login')
        .send(Common.USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .get('/github-api/getAuthenticationData')
            .expect(200)
            .end(function(error1, response1) {
              Should.not.exist(error1);
              response1.body.should.have.property('state')
              done();
            });
        });
    });
  };

