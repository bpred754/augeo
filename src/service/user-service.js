
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
  var Bcrypt = require('bcrypt');

  // Required local modules
  var AugeoDB = require('../model/database');
  var AugeoUtility = require('../utility/augeo-utility');
  var AugeoValidator = require('../validator/augeo-validator');
  var Logger = require('../module/logger');

  // Private Constants
  var ACTIVITY_PER_PAGE = 20;
  var USERS_PER_PAGE = 25;
  var SERVICE = 'user-service';

  // Public Constants
  exports.INCORRECT_LOGIN = 'Incorrect email address or password';
  exports.REMOVE_USER_FAILURE = 'Failed to delete user';

  // Global variables
  var Activity = AugeoDB.model('ACTIVITY');
  var User = AugeoDB.model('AUGEO_USER');
  var log = new Logger();

  exports.addUser = function(user, logData, callback, rollback) {
    log.functionCall(SERVICE, 'addUser', logData.parentProcess, logData.username);

    if(user) {
      if(AugeoValidator.isStringAlphabetic(user.firstName, logData) &&
         AugeoValidator.isStringAlphabetic(user.lastName, logData) &&
         AugeoValidator.isEmailValid(user.email, logData) &&
         AugeoValidator.isUsernameValid(user.username, logData) &&
         AugeoValidator.isPasswordValid(user.password, logData)) {

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
                   newUser.subSkills = AugeoUtility.createSubSkills(AugeoUtility.initializeSubSkillsExperienceArray(AugeoUtility.SUB_SKILLS, logData), logData);
                   newUser.skill = AugeoUtility.getMainSkill(0, logData);

                   // Set user's ranks to be number of users
                   User.getNumberUsers(logData, function(numUsers) {
                     numUsers++; // Add one for this user

                     // Set Augeo skill to number of users
                     newUser.skill.rank = numUsers;

                     // Loop through user data and set ranks
                     for (var i = 0; i < newUser.subSkills.length; i++) {
                       newUser.subSkills[i].rank = numUsers;
                     }

                     User.add(newUser, logData, callback);
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

  exports.doesEmailExist = function(email, logData, callback) {
    log.functionCall(SERVICE, 'doesEmailExist', logData.parentProcess, logData.username, {'email':email});

    if(AugeoValidator.isEmailValid(email, logData)) {
      email = email.toLowerCase();
      User.doesEmailExist(email, logData, callback);
    } else {
      callback(false);
    }
  };
  
  exports.doesUsernameExist = function(username, logData, callback) {
    log.functionCall(SERVICE, 'doesUsernameExist', logData.parentProcess, logData.username);

    if(AugeoValidator.isUsernameValid(username, logData)) {
      User.doesUsernameExist(username, logData, callback);
    } else {
      callback(false);
    }
  };
  
  exports.getCompetitors = function(username, skill, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getCompetitors', logData.parentProcess, logData.username, {'username':username,'skill':skill});

    if(AugeoValidator.isSkillValid(skill, logData) && AugeoValidator.isUsernameValid(username, logData)) {

      User.doesUsernameExist(username, logData, function(userExists) {

        if(!userExists) {
          getCompetitorsWithRankPrivate(1, USERS_PER_PAGE, skill, logData, callback);
        } else {

          // Get users skill rank
          User.getSkillRank(username, skill, logData, function(rank) {

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
            getCompetitorsInPage(skill, startRank, endRank, logData, callback);
          });
        }

      });
    } else {
      rollback(404, 'Invalid skill or username');
    }
  };

  exports.getCompetitorsWithRank = function(startRank, endRank, skill, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getCompetitorsWithRank', logData.parentProcess, logData.username, {'startRank':startRank,'endRank':endRank,'skill':skill})

    if(AugeoValidator.isNumberValid(startRank, logData) && AugeoValidator.isNumberValid(endRank, logData) && AugeoValidator.isSkillValid(skill, logData)) {
      getCompetitorsWithRankPrivate(startRank, endRank, skill, logData, callback);
    } else {
      rollback(404, 'Invalid input');
    }
  };

  // Format necessary data to display on users dashboard
  exports.getDashboardDisplayData = function(username, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getDashboardDisplayData', logData.parentProcess, logData.username, {'username':username});

    var errorImageUrl = 'image/avatar-medium.png';

    if(AugeoValidator.isUsernameValid(username, logData)) {
      User.doesUsernameExist(username, logData, function(usernameExists) {

        if(usernameExists) {
          User.getUserWithUsername(username, logData, function(user) {

            var userData = user.toJSON();
            userData.skill.name = 'Augeo';
            userData.skill.startExperience = AugeoUtility.getLevelStartExperience(userData.skill.level, logData);
            userData.skill.endExperience = AugeoUtility.getLevelEndExperience(userData.skill.level, logData);
            userData.skill.levelProgress = AugeoUtility.calculateLevelProgress(userData.skill.level, userData.skill.experience, logData);

            for(var i = 0; i < userData.subSkills.length; i++) {
              userData.subSkills[i].startExperience = AugeoUtility.getLevelStartExperience(userData.subSkills[i].level, logData);
              userData.subSkills[i].levelProgress = AugeoUtility.calculateLevelProgress(userData.subSkills[i].level, userData.subSkills[i].experience, logData);
              userData.subSkills[i].endExperience = AugeoUtility.getLevelEndExperience(userData.subSkills[i].level, logData);
            }

            Activity.getSkillActivity(userData._id, null, 10, null, logData, function(activities) {
              var displayData = {
                user:userData,
                recentActions: activities
              };
              callback(displayData);
            });
          });
        } else {

          var errorData = {
            errorImageUrl: errorImageUrl
          }
          callback(errorData);
        }
      });
    } else {
      rollback('Invalid username');
    }
  };

  exports.getNumberUsers = function(logData, callback) {
    log.functionCall(SERVICE, 'getNumberUsers', logData.parentProcess, logData.username);
    User.getNumberUsers(logData, callback);
  };

  exports.getSessionUser = function(username, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getSessionUser', logData.parentProcess, logData.username, {'username':username});

    if(AugeoValidator.isUsernameValid(username, logData)) {
      User.getUserWithUsername(username, logData, function(user) {
        callback(user);
      });
    } else {
      rollback(400, 'Failed to retrieve session user object - Invalid username');
    }
  };

  exports.getSkillActivity = function(username, skill, timestamp, logData, callback, rollback) {
    log.functionCall(SERVICE, 'getSkillActivity', logData.parentProcess, logData.username, {'username':username, 'skill':skill,
      'timestamp':timestamp});

    if(AugeoValidator.isUsernameValid(username, logData)) {

      User.getUserWithUsername(username, logData, function(user) {

        if(user) {
          if (AugeoValidator.isSkillValid(skill, logData) && AugeoValidator.isTimestampValid(timestamp, logData)) {
            Activity.getSkillActivity(user._id, skill, ACTIVITY_PER_PAGE, timestamp, logData, function(activities) {

              // Set callback data
              var data = {
                activity: activities
              };

              callback(data);
            });
          } else {
            rollback(400, 'Invalid skill or timestamp');
          }
        } else {
          callback();
        }
      });
    } else {
      rollback(404, 'Invalid username');
    }
  };

  exports.getUser = function(username, logData, callback) {
    log.functionCall(SERVICE, 'getUser', logData.parentProcess, logData.username, {'username': username});

    User.getUserWithUsername(username, logData, callback);
  };

  exports.getUserSecret = function(username, logData, callback) {
    log.functionCall(SERVICE, 'getUserSecret', logData.parentProcess, logData.username, {'username': username});

    User.getUserSecretWithUsername(username, logData, callback);
  };

  exports.isAdmin = function(username, logData, callback) {
    log.functionCall(SERVICE, 'isAdmin', logData.parentProcess, logData.username, {'username':username});

    User.getUserWithUsername(username, logData, function(user) {
      var isAdmin = false;
      if(user) {
        if(user.admin === true) {
          isAdmin = true;
        }
      }
      callback(isAdmin);
    });
  };

  exports.isPasswordValid = function(username, password, logData, callback) {
    log.functionCall(SERVICE, 'isPasswordValid', logData.parentProcess, logData.username, {'username':username});

    if(AugeoValidator.isUsernameValid(username, logData) && AugeoValidator.isPasswordValid(password, logData)) {
      User.getPasswordWithUsername(username, logData, function(hash) {
        if(hash) {
          Bcrypt.compare(password, hash, function(err, isMatch) {
            if(isMatch) {
              callback(true)
            } else {
              callback(false);
            }
          });
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  };

  exports.login = function(email, password, logData, callback, rollback) {
    log.functionCall(SERVICE, 'login', logData.parentProcess, logData.username, {'email':email});

    if(AugeoValidator.isEmailValid(email, logData) && AugeoValidator.isPasswordValid(password, logData)) {

      User.getPasswordWithEmail(email, logData, function(dbPassword){

        if(dbPassword) {
          // Load hash from your password DB.
          Bcrypt.compare(password, dbPassword, function(err, isMatch) {
            if(isMatch) {
              User.getUserWithEmail(email, logData, function(user) {
                callback(user);
              });
            } else {
              rollback(exports.INCORRECT_LOGIN);
            }
          });
        } else {
          rollback(exports.INCORRECT_LOGIN);
        }
      });
    } else  {
      rollback(exports.INCORRECT_LOGIN);
    }
  };

  exports.removeActivities = function(userId, logData, callback, rollback) {
    log.functionCall(SERVICE, 'removeActivities', logData.parentProcess, logData.username, {'userId': userId});

    if(AugeoValidator.isMongooseObjectIdValid(userId, logData)){
      Activity.removeActivities(userId, logData, callback);
    } else {
      rollback(400, 'Failed to remove activities - userId is invalid');
    }
  };

  exports.removeUser = function(username, logData, callback, rollback) {
    log.functionCall(SERVICE, 'removeUser', logData.parentProcess, logData.username, {'username':username});

    if(AugeoValidator.isUsernameValid(username, logData)) {
      User.remove(username, logData, callback);
    } else {
      rollback(400, 'Failed to remove Augeo User - Invalid username');
    }
  };

  exports.saveProfileData = function(profileData, logData, callback) {
    log.functionCall(SERVICE, 'saveProfileData', logData.parentProcess, logData.username, {'profileData.username':(profileData)?profileData.username:'invalid',
      'profileData.profession':(profileData)?profileData.profession:'invalid', 'profileData.location':(profileData)?profileData.location:'invalid',
      'profileData.website':(profileData)?profileData.website:'invalid', 'profileData.description': (profileData)?profileData.description:'invalid'});

    User.saveProfileData(profileData, logData, function(saveSuccessful) {

      if(saveSuccessful) {
        User.getUserWithUsername(profileData.username, logData, function(user) {
          callback(user);
        });
      } else {
        callback();
      }
    });
  };

  exports.setProfileImage = function(interface, user, logData, callback) {
    log.functionCall(SERVICE, 'setProfileImage', logData.parentProcess, logData.username, {'interface':interface, 'username': (user.username)?user.username:'invalid'});

    var profileImageUrl = 'image/avatar-medium.png';
    var profileIcon = 'image/avatar-small.png'
    switch(interface) {
      case 'Twitter':
        profileImageUrl = user.twitter.profileImageUrl;
        profileIcon = user.twitter.profileIcon;
        break;
      case 'Github':
        profileImageUrl = user.github.profileImageUrl;
        profileIcon = user.github.profileImageUrl;
        break;
      case 'Fitbit':
        profileImageUrl = user.fitbit.profileImageUrl;
        profileIcon = user.fitbit.profileImageUrl;
        break;
    };

    User.setProfileImage(user.username, profileImageUrl, profileIcon, logData, function(saveSuccessful) {

      if(saveSuccessful) {
        User.getUserWithUsername(user.username, logData, function(user) {
          callback(user);
        });
      } else {
        callback();
      }
    });
  };

  exports.updateAllRanks = function(logData, callback) {
    log.functionCall(SERVICE, 'updateAllRanks', logData.parentProcess, logData.username);

    exports.updateRanks(logData, function() {

      var subSkills = AugeoUtility.SUB_SKILLS;

      // Recursively set sub skill ranks
      (function updateRanksClojure(i) {
        exports.updateSubSkillRanks(subSkills[i].name, logData, function() {
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

  exports.updateSubSkillRanks = function(subSkill, logData, callback) {
    log.functionCall(SERVICE, 'updateSubSkillRanks', logData.parentProcess, logData.username, {'subSkill':subSkill});

    // Get the number of users
    User.getNumberUsers(logData, function(numUsers) {
      if(numUsers > 0) {
        var rank = 0;
        User.getSubSkillRanks(subSkill, logData, function (docs) {
          docs.forEach(function (p) {
            rank += 1;
            p.subSkills[0].rank = rank;
            if (numUsers == rank) {
              User.updateSubSkillRank(p, rank, AugeoUtility.getSkillIndex(subSkill, logData), logData, callback);
            } else {
              User.updateSubSkillRank(p, rank, AugeoUtility.getSkillIndex(subSkill, logData), logData);
            }
          });
        });
      } else {
        callback();
      }
    });
  };

  exports.updateRanks = function(logData, callback) {
    log.functionCall(SERVICE, 'updateRanks', logData.parentProcess, logData.username);

    // Get the number of users to know when saves are complete
    User.getNumberUsers(logData, function(numUsers) {
      if(numUsers > 0) {
        var rank = 0;
        User.getRanks(logData, function (docs) {
          docs.forEach(function (p) {
            rank += 1;
            p.skill.rank = rank;

            if (rank == numUsers) {
              User.saveDocument(p, logData, callback);
            } else {
              User.saveDocument(p, logData);
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

  var getCompetitorsInPage = function(skill, startRank, endRank, logData, callback) {
    log.functionCall(SERVICE, 'getCompetitorsInPage (private)', logData.parentProcess, logData.username, {'skill':skill,'startRank':startRank,
      'endRank':endRank});

    User.getCompetitorsInPage(skill, startRank, endRank, logData, function(competitors) {
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
  
  var getCompetitorsWithRankPrivate = function(startRank, endRank, skill, logData, callback) {
    log.functionCall(SERVICE, 'getCompetitorsWithRankPrivate (private)', logData.parentProcess, logData.username, {'startRank':startRank,
      'endRank': endRank, 'skill':skill});

    startRank = parseInt(startRank);
    endRank = parseInt(endRank);

    // Get max rank
    User.getMaxRank(skill, logData, function(maxRank) {

      if(startRank > maxRank) {
        endRank = startRank-1;

        var divisor = Math.floor(endRank/USERS_PER_PAGE)
        startRank = divisor*USERS_PER_PAGE+1;
      }

      if(endRank > maxRank) {
        endRank = maxRank;
      }

      getCompetitorsInPage(skill, startRank, endRank, logData, callback);

    });
  };
