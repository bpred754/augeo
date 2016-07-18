
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
  /* Description: Unit test cases for service/user-service                   */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoUtility = require('../../../src/utility/augeo-utility');
  var Common = require('../common');
  var Mongoose = require('../../../src/model/database');
  var TwitterService = require('../../../src/service/twitter-service');
  var UserService = require('../../../src/service/user-service');

  // Global variables
  var User = Mongoose.model('User');

  // addUser
  it('should add new Augeo user to AugeoDB -- addUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.addUser -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.addUser -- in rollback, test failed **');
    };

    var invalidFirstName = {
      firstName: '!Test',
      lastName: Common.USER.lastName,
      email: Common.USER.email,
      username: Common.USER.username,
      password: Common.USER.password
    };

    UserService.addUser(invalidFirstName, callbackFailure, function() {

      var invalidLastName = {
        firstName: Common.USER.firstName,
        lastName: '!Tester',
        email: Common.USER.email,
        username: Common.USER.username,
        password: Common.USER.password
      };

      UserService.addUser(invalidLastName, callbackFailure, function() {

        var invalidEmail = {
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName,
          email: 'email',
          username: Common.USER.username,
          password: Common.USER.password
        };

        UserService.addUser(invalidEmail, callbackFailure, function() {


          var invalidUsername = {
            firstName: Common.USER.firstName,
            lastName: Common.USER.lastName,
            email: Common.USER.email,
            username: '%username%',
            password: Common.USER.password
          }

          UserService.addUser(invalidUsername, callbackFailure, function() {

            var invalidPassword = {
              firstName: Common.USER.firstName,
              lastName: Common.USER.lastName,
              email: Common.USER.email,
              username: Common.USER.username,
              password: '<'
            };

            UserService.addUser(invalidPassword, callbackFailure, function() {

              UserService.addUser(Common.USER, function(user) {

                Assert.strictEqual(user.firstName, Common.USER.firstName);
                Assert.strictEqual(user.lastName, Common.USER.lastName);
                Assert.strictEqual(user.email, Common.USER.email);
                Assert.strictEqual(user.username, Common.USER.username);

                User.getNumberUsers(function(numUsers) {

                  Assert.strictEqual(user.skill.rank, numUsers);
                  Assert.strictEqual(user.subSkills[0].rank, numUsers);

                  done();
                });
              }, rollbackFailure);
            });
          });
        });
      });
    });
  });

  // doesEmailExist
  it('should find Augeo email in AugeoDB -- doesEmailExist()', function(done) {
    this.timeout(Common.TIMEOUT);

    UserService.doesEmailExist('email', function(userExists0) {

      Assert.strictEqual(userExists0, false);

      UserService.doesEmailExist(Common.USER.email, function(userExists1) {

        Assert.strictEqual(userExists1, true);
        done();
      });
    });
  });

  // doesUsernameExist
  it('should find Augeo username in AugeoDB -- doesUsernameExist()', function(done) {
    this.timeout(Common.TIMEOUT);

    UserService.doesUsernameExist('username', function(userExists0) {
      Assert.strictEqual(userExists0, false);

      UserService.doesUsernameExist(Common.USER.username, function(userExists1) {
        Assert.strictEqual(userExists1, true);
        done();
      });
    })
  });

  // getCompetitors
  it('Should return competitors given a skill and a user -- getCompetitors()', function(done) {
    this.timeout(Common.TIMEOUT);

    var invalidUsername = '%%';
    UserService.getCompetitors(invalidUsername, 'Augeo', function(){}, function() {

      var invalidSkill = 'invalidSkill';
      UserService.getCompetitors(Common.USER.username, invalidSkill, function(){}, function() {

        // Get competitors for user that doesn't exist
        UserService.getCompetitors('invalid', 'Augeo', function(competitorsForInvalid) {

          var maxRank0 = 0;
          competitorsForInvalid.length.should.be.above(0);
          for(var i = 0; i < competitorsForInvalid.length; i++) {
            competitorsForInvalid[i].rank.should.be.above(maxRank0);
            Assert.ok(competitorsForInvalid[i].username);
            Assert.ok(competitorsForInvalid[i].rank);
            Assert.strictEqual(competitorsForInvalid[i].experience, 0);
            Assert.ok(competitorsForInvalid[i].level);
            maxRank0 = competitorsForInvalid[i].rank;
          }

          UserService.getCompetitors(Common.USER.username, 'Augeo', function(competitorsForValid) {

            var maxRank1 = 0;
            competitorsForValid.length.should.be.above(0);
            for(var i = 0; i < competitorsForValid.length; i++) {
              competitorsForInvalid[i].rank.should.be.above(maxRank1);
              Assert.ok(competitorsForValid[i].username);
              Assert.ok(competitorsForValid[i].rank);
              Assert.strictEqual(competitorsForValid[i].experience, 0);
              Assert.ok(competitorsForValid[i].level);
              maxRank1 = competitorsForInvalid[i].rank;
            }
            done();
          }, function(){});
        }, function(){});
      });
    });
  });

  // getCompetitorsWithRank
  it('should return competitors within a start and end rank -- getCompetitorsWithRank()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Invalid start rank
    UserService.getCompetitorsWithRank('!', '5', 'Augeo', function(){}, function() {

      // Invalid end rank
      UserService.getCompetitorsWithRank('1', '%', 'Augeo', function(){}, function() {

        // Invalid skill
        UserService.getCompetitorsWithRank('1', '5', 'invalid', function(){}, function() {

          // Valid input
          UserService.getCompetitorsWithRank('1', '5', 'Augeo', function(users) {

            users.length.should.be.above(0);
            users.length.should.be.below(6);
            for(var i = 0; i < users.length; i++) {
              Assert.ok(users[i].username);
              Assert.ok(users[i].rank);
              Assert.strictEqual(users[i].experience, 0);
              Assert.ok(users[i].level);
              Assert.strictEqual(users[i].rank, i+1);
            }
            done();
          }, function(){});
        });
      });
    });
  });

  // getNumberUsers
  it('should return the number of users in the database', function(done) {
    this.timeout(Common.TIMEOUT);

    UserService.getNumberUsers(function(numberUsers) {
      Assert.ok(numberUsers);
      numberUsers.should.be.above(0);
      done();
    });
  });

  // getSessionUser
  it('should retrieve user information from database for current session -- getSessionUser', function(done) {

    // Invalid username
    UserService.getSessionUser('###', function(){}, function() {

      // Valid
      UserService.getSessionUser(Common.USER.username, function(user) {
        Assert.strictEqual(user.firstName, Common.USER.firstName);
        Assert.strictEqual(user.lastName, Common.USER.lastName);

        done();
      });
    });
  });

  // login
  it('should login Augeo user -- login()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.login -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.login -- in rollback, test failed **');
    };

    // Invalid email
    UserService.login('email', Common.USER.password, callbackFailure, function() {

      // Invalid password
      UserService.login(Common.USER.email, 'password', callbackFailure, function() {

        UserService.login(Common.USER.email, Common.USER.password, function(user) {

          Assert.strictEqual(user.firstName, Common.USER.firstName);
          Assert.strictEqual(user.lastName, Common.USER.lastName);
          Assert.strictEqual(user.username, Common.USER.username);

          done();
        }, rollbackFailure);
      });
    });
  });

  // removeUserWithPassword
  it('should remove user from USER table - removeUserWithPassword()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.removeUserWithPassword -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.removeUserWithPassword -- in rollback, test failed **');
    };

    // Add Twitter Actionee entry to USER table so it can be removed
    UserService.addUser(Common.ACTIONEE, function() {

      // Invalid email - execute rollback
      UserService.removeUserWithPassword('!!!', Common.ACTIONEE.password, callbackFailure, function() {

        // Invalid password - execute callback with error
        UserService.removeUserWithPassword(Common.ACTIONEE.username, null, function(error0, user0) {
          Assert.strictEqual(error0, true);
          Should.not.exist(user0);

          // User does not exist for given username - execute rollback
          UserService.removeUserWithPassword('blah', Common.ACTIONEE.password, callbackFailure, function() {

            // Password does not match password in database - execute callback with error
            UserService.removeUserWithPassword(Common.ACTIONEE.username, 'password', function(error1, user1) {
              Assert.strictEqual(error1, true);
              Should.not.exist(user1);

              // Success
              UserService.removeUserWithPassword(Common.ACTIONEE.username, Common.ACTIONEE.password, function(error2, user2) {
                Assert.strictEqual(error2, false);

                // Validate that returned user does not have password
                Should.not.exist(user2.password);

                // Validate that returned user is not in USER table
                User.getUserWithUsername(Common.ACTIONEE.username, function(user3) {
                  Should.not.exist(user3);
                  done();
                });
              });
            });
          });
        });
      });
    }, rollbackFailure);
  });

  // saveProfileData
  it('should save profile data to database with given profile data -- saveProfileData()', function(done) {

    // Verify USER is in database
    User.getUserWithUsername(Common.USER.username, function(user) {
      Assert.strictEqual(user.firstName, Common.USER.firstName);
      Assert.strictEqual(user.profession, '');
      Assert.strictEqual(user.location, '');
      Assert.strictEqual(user.website, '');
      Assert.strictEqual(user.description, '');

      var profileData = {
        username: user.username,
        profession: 'QA',
        location: 'United States',
        website: 'augeo.io',
        description: 'Test user for Augeo application'
      };

      UserService.saveProfileData(profileData, function(userAfter) {
        Assert.strictEqual(userAfter.username, profileData.username);
        Assert.strictEqual(userAfter.profession, profileData.profession);
        Assert.strictEqual(userAfter.location, profileData.location);
        Assert.strictEqual(userAfter.website, profileData.website);
        Assert.strictEqual(userAfter.description, profileData.description);
        done();
      });
    });
  });

  // updateRanks & updateSubSkillRanks
  it('should update the skill and sub skill ranks for all users -- updateSubSkillRanks() & updateRanks()', function(done) {
    this.timeout(Common.TIMEOUT);

    // Retrieve baseline skill for Common user
    User.getUserWithUsername(Common.USER.username, function(user0) {

      var baseSkillRank = user0.skill.rank;

      var baseIndex = 4;
      var general = user0.subSkills[baseIndex];
      var baseExperience = general.experience;
      var baseSubSkillRank = general.rank;

      baseSkillRank.should.be.above(0);
      //baseExperience.should.be.above(0);
      baseSubSkillRank.should.be.above(0);

      Assert.ok(baseSkillRank);
      Assert.ok(baseIndex);
      //Assert.ok(baseExperience);
      Assert.ok(baseSubSkillRank);

      User.getNumberUsers(function(numUsers) {
        numUsers++;

        var newUserSkill = AugeoUtility.getMainSkill(0);
        newUserSkill.rank = numUsers;

        var newUserSubSkills = AugeoUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS));
        for(var i = 0; i < newUserSubSkills.length; i++) {
          newUserSubSkills[i].rank = numUsers;
        }

        var newUser = {
          firstName: Common.ACTIONEE.firstName,
          lastName: Common.ACTIONEE.lastName,
          username: Common.ACTIONEE.username,
          password: Common.ACTIONEE.password,
          skill: newUserSkill,
          subSkills: newUserSubSkills
        };

        // Verify new user is not in database
        User.getUserWithUsername(newUser.username, function(user1) {
          Should.not.exist(user1);

          // Add new user to database
          User.add(newUser, function(user2) {

            var twitterData = {
              twitterId: Common.ACTIONEE.twitter.twitterId,
              name: Common.ACTIONEE.fullName,
              screenName: Common.ACTIONEE.twitter.screenName,
              profileImageUrl: Common.ACTIONEE.twitter.profileImageUrl,
              accessToken: Common.ACTIONEE.twitter.accessToken,
              secretAccessToken: Common.ACTIONEE.twitter.secretAccessToken,
            };

            // Update new user's twitter information
            TwitterService.updateTwitterInfo(user2._id.toString(), twitterData, function() {

              // Verify new user's skill and subSkill rank is higher than Common.USER
              User.getUserWithUsername(Common.ACTIONEE.username, function(user3) {

                var newUserSkillRank = user3.skill.rank;
                var newUserSubSkillRank = user3.subSkills[baseIndex].rank;

                newUserSkillRank.should.be.above(baseSkillRank);
                newUserSubSkillRank.should.be.above(baseSubSkillRank);

                var updateSubSkillExperiences = AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS);
                updateSubSkillExperiences[AugeoUtility.SUB_SKILLS[baseIndex].name] = (baseExperience+1)*100;
                var updateExperience = {
                  mainSkillExperience: (baseExperience+1)*100,
                  subSkillsExperience: updateSubSkillExperiences
                }

                // Update new user's subSkill experience to be more than Common.USER - use User.updateSkillData
                User.updateSkillData(user3._id, updateExperience, function() {

                  // Update ranks
                  UserService.updateRanks(function() {

                    // Update sub skill ranks
                    UserService.updateSubSkillRanks(general.name, function() {

                      User.getUserWithUsername(Common.USER.username, function(user4) {

                        // Update baseline variables
                        baseSkillRank = user4.skill.rank;
                        baseSubSkillRank = user4.subSkills[baseIndex].rank;

                        // Verify new user's subSkill rank is lower than Common.USER
                        User.getUserWithUsername(Common.ACTIONEE.username, function(user5) {
                          user5.skill.rank.should.be.below(baseSkillRank);
                          user5.subSkills[baseIndex].rank.should.be.below(baseSubSkillRank);
                          done();
                        });
                      });
                    });
                  });
                });
              });
            }, function(){});
          });
        });
      });
    });
  });


