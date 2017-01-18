
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
  /* Description: Unit test cases for api/activity-api                       */
  /*              'getActivity' requests                                     */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../../data/common');
  var ActivityService = require('../../../../src/service/activity-service');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Invalid session
    it('should return status 404 - missing username parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/activity-api/getActivity?activityId=587ea02afd8348155a15de62')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Missing activityId parameter
    it('should return status 400 - missing activityId parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

          agent
            .get('/activity-api/getActivity')
            .expect(400)
            .end(function(error1, response1) {
              Should.not.exist(error1);
              done();
            });
        });
    });

    // Non existent activityId parameter
    it('should return status 400 - non existent username parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/activity-api/getActivity?activityId=abcde02afd8348155a15de62')
        .expect(400)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Valid
    it('should return status 200 - valid', function(done) {
      this.timeout(Common.TIMEOUT);

      ActivityService.getSkillActivity(Common.USER.username, Common.USER.username, 'Augeo', new Date(8640000000000000), Common.logData, function (data0) {
        agent
          .get('/activity-api/getActivity?activityId=' + data0.activity[0]._id)
          .expect(200)
          .end(function (error, response) {
            Should.not.exist(error);
            Should.exist(response.body.activity);
            Should.exist(response.body.user);
            Assert.strictEqual(response.body.activity._id, data0.activity[0]._id.toString());
            Assert.strictEqual(response.body.activity.experience, data0.activity[0].experience);
            done();
          });
      });
    });
  };
