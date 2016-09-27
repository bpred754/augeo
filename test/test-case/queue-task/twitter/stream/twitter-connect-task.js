
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
  /* Description: Unit test cases for queue-task/twitter-connect-task        */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Request = require('supertest');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../../../src/model/database');
  var Common = require('../../../../data/common');
  var TwitterConnectTask = require('../../../../../src/queue-task/twitter/stream/twitter-connect-task');

  // Global variables
  var TwitterUser = AugeoDB.model('TWITTER_USER');

  module.exports = function(app) {

    var agent = Request.agent(app);

    it('should open stream with simulated Twitter stream -- execute()', function(done) {

      TwitterUser.getUsers(Common.logData, function(users) {

        var addCallbackExecuted = false;
        var removeCallbackExecuted = false;

        var task = new TwitterConnectTask(users, Common.logData,
          function(tweet) {

            addCallbackExecuted = true;
          },
          function(deleteMessage) {

            removeCallbackExecuted = true;
          },
          function() {});

        task.execute(Common.logData, function() {

          agent
            .get('/test-api/emitTweet')
            .expect(200)
            .end(function(error0, response) {
              Should.not.exist(error0);

              Assert.strictEqual(addCallbackExecuted, true);

              agent
                .get('/test-api/emitDelete')
                .expect(200)
                .end(function(error1, response) {
                  Should.not.exist(error1);

                  Assert.strictEqual(removeCallbackExecuted, true);
                  done();
                });
            });
        });
      });
    });
  };