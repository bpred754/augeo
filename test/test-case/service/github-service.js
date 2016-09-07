
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
  var Common = require('../../data/common');
  var GithubData = require('../../data/github-data');
  var GithubInterfaceService = require('../../../src/interface-service/github-interface-service');
  var GithubService = require('../../../src/service/github-service');

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var Commit = AugeoDB.model('GITHUB_COMMIT');
  var User = AugeoDB.model('AUGEO_USER');
  var GithubUser = AugeoDB.model('GITHUB_USER');

  // addCommits
  it('should add commits to the GITHUB_COMMIT collection -- addCommits()', function(done) {

    // Get initial count of commits in GITHUB_COMMIT collection
    Commit.getCommitCount(Common.logData, function(initialCommitCount) {

      // Try to add empty array of commits
      GithubService.addCommits(GithubData.USER_GITHUB.screenName, new Array(), Common.logData, function() {

        // Get count of commits in GITHUB_COMMIT collection to verify none were added
        Commit.getCommitCount(Common.logData, function(noneAddedCount) {
          Assert.strictEqual(noneAddedCount, initialCommitCount);

          // Get augeo userId for USER and initial experience
          User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {
            var initialExperience = user.skill.experience;

            // Use interface service to get extracted commits
            GithubInterfaceService.getCommits(user, 'accessToken', 'path', '1', null, Common.logData, function(result) {
              Assert.strictEqual(result.commits.length, 4);

              // Add commits
              GithubService.addCommits(GithubData.USER_GITHUB.screenName, result.commits, Common.logData, function() {

                // Verify commit count
                Commit.getCommitCount(Common.logData, function(afterAddCount) {
                  Assert.strictEqual(afterAddCount, initialCommitCount + 4);

                  // Verify commits are in GITHUB_COMMIT collection
                  Commit.getLatestCommit(GithubData.USER_GITHUB.screenName, Common.logData, function(latestCommit) {
                    Assert.equal(latestCommit.eventId, result.commits[0].eventId);

                    // Verify commits are in ACTIVITY collection
                    Activity.getActivity(user._id, latestCommit._id, Common.logData, function(activity) {
                      Should.exist(activity);

                      // Verify user's overall experience and technology experience were increased
                      User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
                        Assert.strictEqual(userAfter.skill.experience, initialExperience + result.commits.length*100);
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  // addUser
  it('should add a Github user to the GITHUB_USER collection -- addUser()', function(done) {

    GithubService.addUser(Common.USER.username, GithubData.USER_GITHUB, Common.logData, function(){}, function(message0) {
      Assert.strictEqual(message0, 'Invalid Github user');

      User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

        var missingGithubId = {
          augeoUser: user._id,
          accessToken: GithubData.USER_GITHUB.accessToken,
          screenName: GithubData.USER_GITHUB.screenName
        };

        GithubService.addUser(Common.USER.username, missingGithubId, Common.logData, function(){}, function(message1) {
          Assert.strictEqual(message1, 'Invalid Github user');

          var missingScreenName = {
            augeoUser: user._id,
            githubId: GithubData.USER_GITHUB.githubId,
            accessToken: GithubData.USER_GITHUB.accessToken
          };

          GithubService.addUser(Common.USER.username, missingScreenName, Common.logData, function(){}, function(message2) {
            Assert.strictEqual(message2, 'Invalid Github user');

            var missingAccessToken = {
              augeoUser: user._id,
              githubId: GithubData.USER_GITHUB.githubId,
              screenName: GithubData.USER_GITHUB.screenName
            };

            GithubService.addUser(Common.USER.username, missingAccessToken, Common.logData, function(){}, function(message3) {
              Assert.strictEqual(message3, 'Invalid Github user');

              var valid = {
                augeoUser: user._id,
                githubId: GithubData.USER_GITHUB.githubId,
                accessToken: GithubData.USER_GITHUB.accessToken,
                screenName: GithubData.USER_GITHUB.screenName
              };

              GithubService.addUser(Common.USER.username, valid, Common.logData, function(){
                User.getUserWithUsername(Common.USER.username, Common.logData, function(updatedUser) {
                  Assert.strictEqual(updatedUser.github.githubId, GithubData.USER_GITHUB.githubId);

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
      GithubService.checkExistingScreenName(GithubData.USER_GITHUB.screenName, Common.logData, function(doesExist1) {
        Assert.strictEqual(doesExist1, true);
        done();
      });
    });
  });

  // getLatestCommitEventId
  it('should get the latest Commit Event ID -- getLatestCommitEventId()', function(done) {

    // Get latest Commit ID
    GithubService.getLatestCommitEventId(GithubData.USER_GITHUB.screenName, Common.logData, function(initialCommitId) {

      User.getUserSecretWithUsername(Common.USER.username, Common.logData, function(user) {

        GithubInterfaceService.getCommits(user, 'accessToken', 'path', '1', null, Common.logData, function(result) {

          var commits = new Array();
          var commit = result.commits[0];
          commit.eventId = 4;
          commits.push(commit);

          // Add Commit
          GithubService.addCommits(GithubData.USER_GITHUB.screenName, commits, Common.logData, function() {

            // Get latest Commit ID and verify it matches the added commit
            GithubService.getLatestCommitEventId(GithubData.USER_GITHUB.screenName, Common.logData, function(latestCommitId) {
              initialCommitId.should.not.be.eql(latestCommitId);
              Assert.equal(latestCommitId, 4);
              done();
            });
          });
        });
      });
    });
  });

  // loopThroughUsersQueueData
  it('should loop through all users queue data and execute a callback for each user -- loopThroughUsersQueueData()', function(done) {

    // Verify there is only one Github user or else done will get called multiple times
    GithubUser.getAllUsers(Common.logData, function(users) {
      Assert.strictEqual(users.length, 1);

      GithubService.loopThroughUsersQueueData(Common.logData, function(queueData) {
        Should.exist(queueData.user.screenName);
        Should.exist(queueData.eventId);
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

      GithubUser.getUserWithScreenName(GithubData.USER_GITHUB.screenName, Common.logData, function (user0) {

        // Valid AugeoUser ID
        GithubService.removeUser(user0.augeoUser, Common.logData, function (removedUser) {
          Assert.strictEqual(removedUser.screenName, GithubData.USER_GITHUB.screenName);

          // Verify Github user is no longer in GITHUB_USER collection
          GithubUser.getUserWithScreenName(GithubData.USER_GITHUB.screenName, Common.logData, function (user1) {
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