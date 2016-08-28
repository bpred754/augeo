
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
  /* Description: Unit test cases for api/user-api 'getCompetitors'          */
  /*              requests                                                   */
  /***************************************************************************/

  // Required libraries
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid username parameter
    it('should return status 200 - invalid username parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

        agent
          .get('/user-api/getCompetitors?username=invalidUsername&skill=Augeo')
          .expect(200)
          .end(function(error1, response1) {
            Should.not.exist(error1);
            done();
          });
        });
    });

    // Invalid skill parameter
    it('should return status 404 - invalid skill parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/user-api/getCompetitors?username=' + Common.USER.username + '&skill=invalidSkill')
        .expect(404)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Valid username and skill with extra params (start and end rank)
    it('should return status 200 - valid request with extra parameters', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/user-api/getCompetitors?username=' + Common.USER.username + '&skill=Augeo&startRank=1&endRank=10')
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          response.body.length.should.be.above(0);

          var item = response.body[0];
          item.username.length.should.be.above(0);
          item.rank.should.be.above(0);
          item.level.should.be.above(0);
          item.experience.should.be.aboveOrEqual(0);

          done();
        });
    });

    it('should return status 404 - missing start rank parameter', function(done) {
      this.timeout(Common.TIMEOUT);
      agent
        .get('/user-api/getCompetitors?endRank=2&skill=Augeo')
        .expect(404)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 404 - missing start rank parameter', function(done) {
      this.timeout(Common.TIMEOUT);
      agent
        .get('/user-api/getCompetitors?startRank=1&skill=Augeo')
        .expect(404)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 404 - missing skill parameter', function(done) {
      this.timeout(Common.TIMEOUT);
      agent
        .get('/user-api/getCompetitors?startRank=1&endRank=2')
        .expect(404)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    it('should return status 200 - valid request with start/end ranks and skill parameters', function(done) {
      this.timeout(Common.TIMEOUT);
      agent
        .get('/user-api/getCompetitors?startRank=1&endRank=1&skill=Augeo')
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          response.body.length.should.be.above(0);

          var item = response.body[0];
          item.username.length.should.be.above(0);
          item.rank.should.be.above(0);
          item.level.should.be.above(0);
          item.experience.should.be.aboveOrEqual(0);
          done();
        });
    });
  };
