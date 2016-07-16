
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
  /* Description: Unit test cases for api/twitter-api                        */
  /*              'getLeaderboardDisplayData' requests                       */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');
  var AugeoUtility = require('../../../../src/utility/augeo-utility');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid username in session
    it('should return status 401 - invalid username in session', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/twitter-api/getLeaderboardDisplayData')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Valid username in session
    it('should return status 200 - valid username in session', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .get('/twitter-api/getLeaderboardDisplayData')
            .expect(200)
            .end(function(error1, response1) {
              Should.not.exist(error1);

              var skills = response1.body.skills;
              var actualSkills = AugeoUtility.SUB_SKILLS;

              skills.length.should.be.above(0);

              for(var i = 0; i < skills.length; i++) {
                Assert.strictEqual(skills[i].name, actualSkills[i].name);
                Assert.strictEqual(skills[i].glyphicon, actualSkills[i].glyphicon);
              }

              done();
            });
        });
    });

  };
