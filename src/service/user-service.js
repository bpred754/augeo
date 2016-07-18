
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
  /* Description: Handles logic interfacing with USER collection             */
  /***************************************************************************/

  // Required libraries
  var AugeoDB = require('../model/database');
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Bcrypt = require('bcrypt');

  // Constants
  var USERS_PER_PAGE = 25;

  // Global variables
  var User = AugeoDB.model('User');

  exports.addUser = function(user, callback, rollback) {

    if(user) {
      if(AugeoValidator.isStringAlphabetic(user.firstName) &&
         AugeoValidator.isStringAlphabetic(user.lastName) &&
         AugeoValidator.isEmailValid(user.email) &&
         AugeoValidator.isUsernameValid(user.username) &&
         AugeoValidator.isPasswordValid(user.password)) {

           // Make sure email is lowercase
           user.email = user.email.toLowerCase();

           // Encrypt password
           Bcrypt.genSalt(10, function(genSaltError, salt) {

             if(genSaltError) {
               rollback();
             } else {
               Bcrypt.hash(user.password, salt, function(hashError, hash) {

                 if(hashError) {
                   rollback();
                 } else {
                   var newUser = Object.create(user);
                   newUser.password = hash;

                   // Initialize skill data
                   newUser.subSkills = AugeoUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS));
                   newUser.skill = AugeoUtility.getMainSkill(0);

                   // Set user's ranks to be number of users
                   User.getNumberUsers(function(numUsers) {
                     numUsers++; // Add one for this user

                     // Set Augeo skill to number of users
                     newUser.skill.rank = numUsers;

                     // Loop through user data and set ranks
                     for (var i = 0; i < newUser.subSkills.length; i++) {
                       newUser.subSkills[i].rank = numUsers;
                     }

                     User.add(newUser, callback);
                   });
                 }
               });
             }
           });
         } else {
           rollback();
         }
    } else {
      rollback();
    }

  };

  exports.doesEmailExist = function(email, callback) {
    if(AugeoValidator.isEmailValid(email)) {
      email = email.toLowerCase();
      User.doesEmailExist(email, callback);
    } else {
      callback(false);
    }
  };
  
  exports.doesUsernameExist = function(username, callback) {
    if(AugeoValidator.isUsernameValid(username)) {
      User.doesUsernameExist(username, callback);
    } else {
      callback(false);
    }
  };
  
  exports.getCompetitors = function(username, skill, callback, rollback) {

    if(AugeoValidator.isSkillValid(skill) && AugeoValidator.isUsernameValid(username)) {

      User.doesUsernameExist(username, function(userExists) {

        if(!userExists) {
          getCompetitorsWithRankPrivate(1, USERS_PER_PAGE, skill, callback);
        } else {

          // Get users skill rank
          User.getSkillRank(username, skill, function(rank) {

            // Divisor = Users rank divided by USERS_PER_PAGE.
            var divisor;
            if(rank % USERS_PER_PAGE == 0) {
              divisor = rank/USERS_PER_PAGE -1;
            } else {
              divisor = Math.floor(rank/USERS_PER_PAGE);
            }

            var startRank = divisor * USERS_PER_PAGE + 1;
            var endRank = (divisor + 1) * USERS_PER_PAGE;

            // Get users with skill rank greater than or equal to 25*Divisor and less than 25*(Divisor+1)
            getCompetitorsInPage(skill, startRank, endRank, callback);
          });
        }

      });
    } else {
      rollback();
    }
  };

  exports.getCompetitorsWithRank = function(startRank, endRank, skill, callback, rollback) {

    if(AugeoValidator.isNumberValid(startRank) && AugeoValidator.isNumberValid(endRank) && AugeoValidator.isSkillValid(skill)) {
      getCompetitorsWithRankPrivate(startRank, endRank, skill, callback);
    } else {
      rollback();
    }
  };

  exports.getNumberUsers = function(callback) {
    User.getNumberUsers(callback);
  };

  exports.getSessionUser = function(username, callback, rollback) {
    if(AugeoValidator.isUsernameValid(username)) {
      User.getUserWithUsername(username, function(user) {
        callback(user);
      });
    } else {
      rollback();
    }
  };

  exports.login = function(email, password, callback, rollback) {

    if(AugeoValidator.isEmailValid(email) && AugeoValidator.isPasswordValid(password)) {

      User.getPasswordWithEmail(email, function(dbPassword){

        if(dbPassword) {
          // Load hash from your password DB.
          Bcrypt.compare(password, dbPassword, function(err, isMatch) {
            if(isMatch) {
              User.getUserWithEmail(email, function(user) {
                callback(user);
              });
            } else {
              rollback();
            }
          });
        } else {
          rollback();
        }
      });
    } else  {
      rollback();
    }
  };

  exports.removeUser = function(username, callback) {
    if(AugeoValidator.isUsernameValid(username)) {
      User.remove(username, callback);
    }
  };

  exports.removeUserWithPassword = function(username, password, callback, rollback) {

    if(AugeoValidator.isUsernameValid(username)) {
      if(AugeoValidator.isPasswordValid(password)) {
        User.getPasswordWithUsername(username, function(hash) {
          if(hash) {
            Bcrypt.compare(password, hash, function(err, isMatch) {
              if(isMatch) {
                // Remove user
                exports.removeUser(username, function(removedUser) {
                  // Update ranks
                  exports.updateAllRanks(function() {
                    // Remove password attribute from object
                    removedUser = removedUser.toObject();
                    delete removedUser.password;
                    callback(false, removedUser);
                  });
                });
              } else {
                callback(true);
              }
            });
          } else {
            rollback();
          }
        });
      } else {
        callback(true);
      }
    } else {
      rollback();
    }
  };

  exports.saveProfileData = function(profileData, callback) {
    User.saveProfileData(profileData, function(saveSuccessful) {

      if(saveSuccessful) {
        User.getUserWithUsername(profileData.username, function(user) {
          callback(user);
        });
      } else {
        callback();
      }
    });
  };

  exports.updateAllRanks = function(callback) {

    exports.updateRanks(function() {

      var subSkills = AugeoUtility.SUB_SKILLS;

      // Recursively set sub skill ranks
      (function updateRanksClojure(i) {
        exports.updateSubSkillRanks(subSkills[i].name,function() {
          i++;
          if(i < subSkills.length) {
            updateRanksClojure(i);
          } else {
            callback();
          }
        });
      })(0); // End clojure
    }); // End updateRanks
  };

  exports.updateSubSkillRanks = function(subSkill, callback) {

    // Get the number of users
    User.getNumberUsers(function(numUsers) {
      if(numUsers > 0) {
        var rank = 0;
        User.getSubSkillRanks(subSkill, function (docs) {
          docs.forEach(function (p) {
            rank += 1;
            p.subSkills[0].rank = rank;
            if (numUsers == rank) {
              User.updateSubSkillRank(p, rank, AugeoUtility.getSkillIndex(subSkill), callback);
            } else {
              User.updateSubSkillRank(p, rank, AugeoUtility.getSkillIndex(subSkill));
            }
          });
        });
      } else {
        callback();
      }
    });
  };

  exports.updateRanks = function(callback) {

    // Get the number of users to know when saves are complete
    User.getNumberUsers(function(numUsers) {
      if(numUsers > 0) {
        var rank = 0;
        User.getRanks(function (docs) {
          docs.forEach(function (p) {
            rank += 1;
            p.skill.rank = rank;

            if (rank == numUsers) {
              User.saveDocument(p, callback);
            } else {
              User.saveDocument(p);
            }
          });
        });
      } else {
        callback();
      }
    });
  };

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  var getCompetitorsInPage = function(skill, startRank, endRank, callback) {

    User.getCompetitorsInPage(skill, startRank, endRank, function(competitors) {
      var users = new Array();
      for(var i = 0; i < competitors.length; i++) {

        var competitor;
        if(skill === 'Augeo') {
          competitor = competitors[i].skill;
        } else {
          competitor = competitors[i].subSkills[0];
        }

        var user = {
          username: competitors[i].username,
          twitterScreenName: competitors[i].twitter ? competitors[i].twitter.screenName : null,
          rank: competitor.rank,
          level: competitor.level,
          experience: competitor.experience
        };

        users.push(user);
      }

      callback(users);
    });
  };
  
  var getCompetitorsWithRankPrivate = function(startRank, endRank, skill, callback) {
    startRank = parseInt(startRank);
    var endRank = parseInt(endRank);

    // Get max rank
    User.getMaxRank(skill, function(maxRank) {

      if(startRank > maxRank) {
        endRank = startRank-1;

        var divisor = Math.floor(endRank/USERS_PER_PAGE)
        startRank = divisor*USERS_PER_PAGE+1;
      }

      if(endRank > maxRank) {
        endRank = maxRank;
      }

      getCompetitorsInPage(skill, startRank, endRank, callback);

    });
  };
