
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
  /* Description: Unit test cases for queue-task/github-event-task           */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../../src/model/database');
  var Common = require('../../../data/common');
  var GithubEventTask = require('../../../../src/queue-task/github/github-event-task');
  var GithubData = require('../../../data/github-data');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');
  var githubData = {
    accessToken: GithubData.USER_GITHUB.accessToken,
    screenName: GithubData.USER_GITHUB.screenName
  };

  it('should set eTag if its the first request -- execute()', function(done) {

    User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new GithubEventTask(user, githubData, null, Common.logData);
      task.execute(Common.logData, function(updatedTask) {
        Assert.strictEqual(updatedTask.commits.length, 4);
        Assert.strictEqual(updatedTask.eTag, '1');
        updatedTask.path.should.be.ok();
        Assert.strictEqual(updatedTask.poll, 60000);
        updatedTask.wait.should.be.aboveOrEqual( 60000);
        done();
      });
    });
  });

  it('should set lastEventId to null if its the last request -- execute()', function(done) {
    User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new GithubEventTask(user, githubData, '0', Common.logData);
      task.execute(Common.logData, function (updatedTask) {
        Assert.strictEqual(updatedTask.commits.length, 3);
        updatedTask.eTag.should.be.ok();
        Should.not.exist(updatedTask.path);
        updatedTask.lastEventId.should.be.ok();
        Assert.strictEqual(updatedTask.poll, 60000);
        updatedTask.wait.should.be.aboveOrEqual( 60000);
        done();
      });
    });
  });

  it('should reset the task to initial values -- reset()', function(done) {

    User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {
      var task = new GithubEventTask(user, githubData, '0', Common.logData);
      task.commits.push('test');
      task.path = 'test';
      task.wait = 10;

      Assert.strictEqual(task.commits.length, 1);
      task.reset(Common.logData);

      Assert.strictEqual(task.commits.length, 0);
      Assert.strictEqual(task.path, '/users/' + task.screenName + '/events');
      Assert.strictEqual(task.wait, 0);

      done();
    });
  });