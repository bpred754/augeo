
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
  /* Description: Unit test cases for api/user-api 'set-profile-image'       */
  /*   requests                                                              */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    it('should return status 401 -- invalid session', function(done) {
      this.timeout(Common.TIMEOUT);

      var data = {
        interface:'Twitter'
      };

      agent
        .post('/user-api/setProfileImage')
        .send(data)
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 200 -- no interface data', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .post('/user-api/setProfileImage')
            .send({})
            .expect(200)
            .end(function (error1, response1) {
              Assert.strictEqual(response1.body.profileImg, 'image/avatar-medium.png');
              Assert.strictEqual(response1.body.profileIcon, 'image/avatar-small.png');
              Should.not.exist(error1);
              done();
            });
        });
    });

    it('should return status 200 -- interface data specified', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .post('/user-api/setProfileImage')
        .send({interface:'Twitter'})
        .expect(200)
        .end(function (error1, response1) {
          Assert.strictEqual(response1.body.profileImg, 'https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs.jpg');
          Assert.strictEqual(response1.body.profileIcon, 'https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg');
          Should.not.exist(error1);
          done();
        });
    });
  };
