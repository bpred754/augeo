
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
  /* Description: Unit test cases for api/user-api 'login' requests          */
  /***************************************************************************/

  // Required libraries
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');

  it('should return status 400 - login user with missing login information', function(done) {
    this.timeout(Common.TIMEOUT);

    Request(process.env.AUGEO_HOME)
      .post('/user-api/login')
      .expect(400)
      .end(function(error, response) {
        Should.not.exist(error);
        response.should.have.property('text','Incorrect email address or password');
        done();
      });
  });

  it('should return status 400 - login user with invalid email', function(done) {
    this.timeout(Common.TIMEOUT);

    var loginInvalidEmail = {
      email: 'tester.com',
      password: Common.USER.password
    }

    Request(process.env.AUGEO_HOME)
      .post('/user-api/login')
      .send(loginInvalidEmail)
      .expect(400)
      .end(function(error, response) {
        Should.not.exist(error);
        response.should.have.property('text','Incorrect email address or password');
        done();
      });
  });

  it('should return status 400 - login user with invalid password', function(done) {
    this.timeout(Common.TIMEOUT);

    var loginInvalidPassword = {
      email: Common.USER.email,
      password: '<'
    }

    Request(process.env.AUGEO_HOME)
      .post('/user-api/login')
      .send(loginInvalidPassword)
      .expect(400)
      .end(function(error, response) {
        Should.not.exist(error);
        response.should.have.property('text','Incorrect email address or password');
        done();
      });
  });
