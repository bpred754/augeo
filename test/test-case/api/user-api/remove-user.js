
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
  /* Description: Unit test cases for api/user-api 'remove-user' requests    */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    it('should return status 200 - add valid user', function(done) {
      this.timeout(Common.TIMEOUT);

      Request(process.env.AUGEO_HOME)
        .post('/user-api/add')
        .send(Common.ACTIONEE)
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 400 - no user in session', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/user-api/remove')
        .send({password:Common.ACTIONEE.password})
        .expect(400)
        .end(function(error, response) {
          Assert.strictEqual(response.error.text, 'Failed to delete user');
          done();
        })
    });

    it('should return status 200 - login user with valid credentials', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/user-api/login')
        .send(Common.ACTIONEE)
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        })
    });

    it('should return status 401 - invalid password', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/user-api/remove')
        .send({password:'password'})
        .expect(401)
        .end(function(error, response) {
          Assert.strictEqual(response.error.text, 'Incorrect password');
          done();
        })
    });

    it('should return status 200 - remove user', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/user-api/remove')
        .send(Common.ACTIONEE)
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        })
    });
  };
