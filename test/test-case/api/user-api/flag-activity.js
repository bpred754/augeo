
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
  /* Description: Unit test cases for api/user-api 'flag-activity' requests  */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');

  module.exports = function(app) {

    var agent = Request.agent(app);

    it('should return status 400 - flag activity without being logged in', function (done) {
      this.timeout(Common.TIMEOUT);

     agent
        .post('/user-api/flagActivity')
        .expect(400)
        .end(function (error, response) {
          Should.not.exist(error);
          Assert.strictEqual(response.error.text, 'Invalid session')
          done();
        });
    });

    it('should return status 400 - invalid data', function(done) {

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          var stagedFlag = {
            activityId:null,
            classification:'General',
            suggestedClassification: 'Fitness'
          };

          agent
            .post('/user-api/flagActivity')
            .send(stagedFlag)
            .expect(400)
            .end(function(error1, response1) {
              Should.not.exist(error1);
              Assert.strictEqual(response1.error.text, 'Invalid Request')
              done();
            });
        });
    });

    it('should return status 200 - valid request', function(done) {

      var stagedFlag = {
        activityId:'585c4b55a3e3c83bfc2f46ef',
        classification:'General',
        suggestedClassification: 'Fitness'
      };

      agent
        .post('/user-api/flagActivity')
        .send(stagedFlag)
        .expect(200)
        .end(function(error1, response1) {
          Should.not.exist(error1);
          done();
        });
    });
  };
