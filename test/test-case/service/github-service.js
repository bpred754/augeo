
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
  /* Description: Unit test cases for service/github-service                 */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var Common = require('../common');
  var GithubService = require('../../../src/service/github-service');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');
  var GithubUser = AugeoDB.model('GITHUB_USER');

  // addUser
  it('should add a Github user to the GITHUB_USER collection -- addUser()', function(done) {

    GithubService.addUser(Common.USER.username, Common.USER_GITHUB, Common.logData, function(){}, function(message0) {
      Assert.strictEqual(message0, 'Invalid Github user');

      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        var missingGithubId = {
          augeoUser: user._id,
          accessToken: Common.USER_GITHUB.accessToken,
          screenName: Common.USER_GITHUB.screenName
        };

        GithubService.addUser(Common.USER.username, missingGithubId, Common.logData, function(){}, function(message1) {
          Assert.strictEqual(message1, 'Invalid Github user');

          var missingScreenName = {
            augeoUser: user._id,
            githubId: Common.USER_GITHUB.githubId,
            accessToken: Common.USER_GITHUB.accessToken
          };

          GithubService.addUser(Common.USER.username, missingScreenName, Common.logData, function(){}, function(message2) {
            Assert.strictEqual(message2, 'Invalid Github user');

            var missingAccessToken = {
              augeoUser: user._id,
              githubId: Common.USER_GITHUB.githubId,
              screenName: Common.USER_GITHUB.screenName
            };

            GithubService.addUser(Common.USER.username, missingAccessToken, Common.logData, function(){}, function(message3) {
              Assert.strictEqual(message3, 'Invalid Github user');

              var valid = {
                augeoUser: user._id,
                githubId: Common.USER_GITHUB.githubId,
                accessToken: Common.USER_GITHUB.accessToken,
                screenName: Common.USER_GITHUB.screenName
              };

              GithubService.addUser(Common.USER.username, valid, Common.logData, function(){
                User.getUserWithUsername(Common.USER.username, Common.logData, function(updatedUser) {
                  Assert.strictEqual(updatedUser.github.githubId, Common.USER_GITHUB.githubId);

                  done();
                });
              }, function(){});
            });
          });
        });
      });
    });
  });

  // checkExistingScreenName
  it('should check if the specified Github user exists in the GITHUB_USER collection -- checkExistingScreenName()', function(done) {

    // Screen name that doesn't exist
    var screenName0 = 'doesntExist';
    GithubService.checkExistingScreenName(screenName0, Common.logData, function(doesExist0) {
      Assert.strictEqual(doesExist0, false);

      // Valid existing screen name
      GithubService.checkExistingScreenName(Common.USER_GITHUB.screenName, Common.logData, function(doesExist1) {
        Assert.strictEqual(doesExist1, true);
        done();
      });
    });
  });

  // removeUser
  it('should remove Github user from GITHUB_USER collection -- removeUser()', function(done) {

    // Invalid AugeoUser ID
    GithubService.removeUser(undefined, Common.logData, function () {
    }, function (message) {
      Assert.strictEqual(message, 'Invalid AugeoUser ID');

      GithubUser.getUserWithScreenName(Common.USER_GITHUB.screenName, Common.logData, function (user0) {

        // Valid AugeoUser ID
        GithubService.removeUser(user0.augeoUser, Common.logData, function (removedUser) {
          Assert.strictEqual(removedUser.screenName, Common.USER_GITHUB.screenName);

          // Verify Github user is no longer in GITHUB_USER collection
          GithubUser.getUserWithScreenName(Common.USER_GITHUB.screenName, Common.logData, function (user1) {
            Should.not.exist(user1);

            // Verify AugeoUser no longer has reference to GITHUB_USER
            User.getUserWithUsername(Common.USER.username, Common.logData, function (user2) {
              Should.not.exist(user2.github);
              done();
            });
          });
        });
      });
    });
  });



