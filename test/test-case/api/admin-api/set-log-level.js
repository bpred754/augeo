
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
  /* Description: Unit test cases for api/admin-api 'set-log-level' requests */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid Session
    it('should return status 401 - invalid session', function (done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/admin-api/setLogLevel')
        .expect(401)
        .end(function (error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.res.text, 'Invalid session');
          done();
        });
    });

    // Not an admin user
    it('should return status 400 - user is not admin', function (done) {
      this.timeout(Common.TIMEOUT);

      // Add user with no admin rights
      agent
        .post('/user-api/add')
        .send(Common.ACTIONEE)
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);

          // Login in user
          agent
            .post('/user-api/login')
            .send(Common.ACTIONEE)
            .expect(200)
            .end(function(error, response) {
              Should.not.exist(error);

              agent
                .get('/admin-api/setLogLevel')
                .expect(400)
                .end(function (error, response) {
                  Should.not.exist(error);
                  Assert.strictEqual(response.res.text, 'Not an admin user');
                  done();
                });
            });
        });
    });
  };
