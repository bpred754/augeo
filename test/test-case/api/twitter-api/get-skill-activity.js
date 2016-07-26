
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
  /*              'getActivityDisplayData' requests                          */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var Common = require('../../common');
  var TwitterInterfaceService = require('../../../../src/interface-service/twitter-interface-service');
  var TwitterService = require('../../../../src/service/twitter-service');

  module.exports = function(app) {

    var agent = Request.agent(app);

    // Missing username parameter - invalid session
    it('should return status 404 - missing username parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/twitter-api/getSkillActivity?skill=Augeo&tweetID=9999999999999999999999999999999')
        .expect(401)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Missing skill parameter
    it('should return status 404 - missing skill parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      // Login in user
      agent
        .post('/user-api/login')
        .send(Common.LOGIN_USER)
        .expect(200)
        .end(function(error0, response0) {
          Should.not.exist(error0);

        agent
          .get('/twitter-api/getSkillActivity?username=' + Common.USER.username + '&tweetID=9999999999999999999999999999999')
          .expect(404)
          .end(function(error1, response1) {
            Should.not.exist(error1);
            done();
          });
        });
    });

    // Missing tweetId parameter
    it('should return status 404 - missing tweetId parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/twitter-api/getSkillActivity?username=' + Common.USER.username + '&skill=Augeo')
        .expect(404)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Non existent username parameter
    it('should return status 404 - non existent username parameter', function(done) {
      this.timeout(Common.TIMEOUT);

      agent
        .get('/twitter-api/getSkillActivity?username=invalid&skill=Augeo&tweetId=9999999999999999999999999999999')
        .expect(200)
        .end(function(error, response) {
          Should.not.exist(error);
          done();
        });
    });

    // Valid
    it('should return status 200 - valid', function(done) {
      this.timeout(Common.TIMEOUT);

      // Add activity to be retrieved
      var action0 = TwitterInterfaceService.extractAction(Common.rawStandardTweet, Common.logData);
      var tweet0 = TwitterInterfaceService.extractTweet(Common.rawStandardTweet, false, Common.logData);
      var mention0 = TwitterInterfaceService.extractReply(Common.rawStandardTweet, Common.logData);

      TwitterService.addAction(action0, tweet0, mention0, Common.logData, function(classification0) {

        agent
          .get('/twitter-api/getSkillActivity?username=' + Common.USER.username + '&skill=Augeo&tweetId=9999999999999999999999999999999')
          .expect(200)
          .end(function(error, response) {
            Should.not.exist(error);
            Should.exist(response.body.activity);
            Assert.strictEqual(response.body.activity.length, 1);
            Assert.strictEqual(response.body.activity[0].tweetId, Common.rawStandardTweet.id_str);
            done();
          });
      });
    });

  };
