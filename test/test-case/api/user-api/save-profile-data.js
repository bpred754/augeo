
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
  /* Description: Unit test cases for api/user-api 'save-profile-data'       */
  /*   requests                                                              */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    it('should return status 401 -- invalid session', function(done) {
      this.timeout(Common.TIMEOUT);

      var invalidUser = {
        firstName: Common.USER.firstName,
        lastName: Common.USER.lastName
      };

      agent
        .post('/user-api/saveProfileData')
        .send(invalidUser)
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });

    });

    it('should return status 400 - session and profileData users do not match', function(done) {

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          //  Verify profile data is not present
          agent
            .get('/user-api/getStateChangedData')
            .expect(200)
            .end(function(error1, response1){

              var user1 = response1.body.user;
              Assert.strictEqual(user1.username, Common.USER.username);
              Assert.strictEqual(user1.profession, '');
              Assert.strictEqual(user1.location, '');
              Assert.strictEqual(user1.website, '');
              Assert.strictEqual(user1.description, '');

              var invalidProfileData = {
                firstName: Common.USER.firstName,
                lastName: Common.USER.lastName,
                username: Common.ACTIONEE.username,
                profession: 'Tester',
                location: 'Arizona',
                website: 'augeo.io',
                description: 'Tester for Augeo application'
              };

              agent
                .post('/user-api/saveProfileData')
                .send(invalidProfileData)
                .expect(400)
                .end(function(error2, response2) {
                  Should(error2).be.ok;
                  done();
                });
            });
        });
    });
    
    it('should return status 200 - valid', function(done) {
      
      // Verify profile data is not present
      agent
        .get('/user-api/getStateChangedData')
        .expect(200)
        .end(function(error1, response1){

          var user1 = response1.body.user;
          Assert.strictEqual(user1.username, Common.USER.username);
          Assert.strictEqual(user1.profession, '');
          Assert.strictEqual(user1.location, '');
          Assert.strictEqual(user1.website, '');
          Assert.strictEqual(user1.description, '');

          var validProfileData = {
            firstName: Common.USER.firstName,
            lastName: Common.USER.lastName,
            username: Common.USER.username,
            profession: 'Tester',
            location: 'Arizona',
            website: 'augeo.io',
            description: 'Tester for Augeo application'
          };

          // Save the profile data
          agent
            .post('/user-api/saveProfileData')
            .send(validProfileData)
            .expect(200)
            .end(function(error2, response2) {
              var body2 = response2.body;
              Assert.strictEqual(body2.username, Common.USER.username);
              Assert.strictEqual(body2.profession, validProfileData.profession);
              Assert.strictEqual(body2.location, validProfileData.location);
              Assert.strictEqual(body2.website, validProfileData.website);
              Assert.strictEqual(body2.description, validProfileData.description);

              // Verify profile data is in session
              agent
                .get('/user-api/getStateChangedData')
                .expect(200)
                .end(function(error3, response3) {

                  var user2 = response3.body.user;
                  Assert.strictEqual(user2.username, Common.USER.username);
                  Assert.strictEqual(user2.profession, validProfileData.profession);
                  Assert.strictEqual(user2.location, validProfileData.location);
                  Assert.strictEqual(user2.website, validProfileData.website);
                  Assert.strictEqual(user2.description, validProfileData.description);

                  done();
                });
            });
        });
    });
  };
