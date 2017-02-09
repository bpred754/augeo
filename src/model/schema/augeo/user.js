
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
  /* Description: Logic for AUGEO_USER database collection                   */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');

  // Required local modules
  var AugeoDB = require('../../database');
  var Logger = require('../../../module/logger');
  var AugeoUtility = require('../../../utility/augeo-utility');

  // Constants
  var COLLECTION = 'augeo_user-collection';

  // Global variables
  var log = new Logger();

  // Schema declaration
  var AUGEO_USER = Mongoose.Schema({
    admin: Boolean,
    description: String,
    email: String,
    firstName: String,
    fitbit: {type: Mongoose.Schema.Types.ObjectId, ref: 'FITBIT_USER'},
    github: {type: Mongoose.Schema.Types.ObjectId, ref: 'GITHUB_USER'},
    lastName: String,
    location: String,
    password: String,
    profession: String,
    profileIcon: String,
    profileImg: String,
    sendGridId: String,
    signupDate: { type: Date, default: Date.now },
    skill: {
      imageSrc: String,
      level: Number,
      experience: Number,
      rank:Number
    },
    subSkills:[{
      name: String,
      glyphicon: String,
      experience: Number,
      level: Number,
      rank:Number
    }],
    twitter: {type: Mongoose.Schema.Types.ObjectId, ref: 'TWITTER_USER'},
    username: String,
    website: String
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  AUGEO_USER.statics.add = function(user, logData, callback) {
    this.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: user.password,
      admin: false,
      sendGridId: user.sendGridId,
      profileImg: user.profileImg,
      profileIcon: user.profileIcon,
      profession: '',
      location: '',
      website: '',
      description: '',
      subSkills: user.subSkills,
      skill: user.skill
    }, function(error, pUser) {
      if(error) {
        log.functionError(COLLECTION, 'add', logData.parentProcess, logData.username,
          'Failed to add ' + (user)?user.username:'invalid' + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'add', logData.parentProcess, logData.username, {'user.username':(user)?user.username:'invalid'});
        callback(pUser);
      }
    });
  };

  AUGEO_USER.statics.doesEmailExist = function(email, logData, callback) {
    var emailExists = false;
    this.count({email:{'$regex': AugeoUtility.buildRegex(email, logData), $options: 'i'}}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'doesEmailExist', logData.parentProcess, logData.username,
          'Failed to find count for ' + email + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'doesEmailExist', logData.parentProcess, logData.username, {'email':email});
        if(count > 0) {
          emailExists = true;
        }
      }
      callback(emailExists);
    });
  };

  AUGEO_USER.statics.doesUsernameExist = function(username, logData, callback) {
    var usernameExists = false;
    this.count({'username':{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}}, function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'doesUsernameExist', logData.parentProcess, logData.username,
          'Failed to check if username: ' + username + ' exists. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'doesUsernameExist', logData.parentProcess, logData.username, {'username':username});
        if(count > 0) {
          usernameExists = true;
        }
      }
      callback(usernameExists);
    });
  };

  AUGEO_USER.statics.getCompetitorsInPage = function(skill, startRank, endRank, logData, callback) {

    if(skill === 'Augeo') {

      this.find(
        { // Get users where rank is >= startRank and <= endRank
          'skill.rank': {$gte:startRank, $lte:endRank}
        },
        { // Specify attributes to return
          'username': 1,
          'skill.rank':1,
          'skill.level':1,
          'skill.experience':1
        },
        {
          sort: {
            'skill.rank':1
          }
        })
        .exec(function(error, competitors) {
          if(error) {
            log.functionError(COLLECTION, 'getCompetitorsInPage', logData.parentProcess, logData.username,
              'Failed to get competitors in page for skill: ' + skill + '. Error: ' + error);
          } else {
              log.functionCall(COLLECTION, 'getCompetitorsInPage', logData.parentProcess, logData.username, {'skill':skill,
                'startRank':startRank,'endRank':endRank});
            callback(competitors);
          }
        });
    } else {

      // Build query
      var fields = getSubSkillQuery(skill);
      fields.$project['username'] = 1;

      this.aggregate([
        fields,
        {
          '$match':
          {
            'subSkills.rank': {$gte:startRank, $lte:endRank},
          }
        },
        {
          '$sort':
          {
            'subSkills.rank': 1,
          }
        }
      ],
      function(error, users) {
        if(error) {
          log.functionError(COLLECTION, 'getCompetitorsInPage', logData.parentProcess, logData.username,
            'Failed to find leaders for skill: ' + skill + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getCompetitorsInPage', logData.parentProcess, logData.username, {
            'skill': skill, 'startRank': startRank, 'endRank': endRank});
        }

        callback(users);
      });
    }
  };

  AUGEO_USER.statics.getMaxRank = function(skill, logData, callback) {

    if(skill === 'Augeo') {
      // Find max rank
      this.find({},{'skill.rank':1}, {sort:{'skill.rank':-1}, limit:1}, function(error, data) {
        if(error) {
          log.functionError(COLLECTION, 'getMaxRank', logData.parentProcess, logData.username,
            'Failed to find max rank for skill ' + skill + '. Error: ' + error);
        } else {
          var maxRank = data[0].skill.rank;
          log.functionCall(COLLECTION, 'getMaxRank', logData.parentProcess, logData.username, {'skill':skill});
          callback(maxRank);
        }
      });
    } else {
      this.aggregate([
        getSubSkillQuery(skill),
        {
          "$sort": {
            "subSkills.rank": -1
          }
        },
        {
          "$limit" : 1
        }
      ],
      function(error, data) {
        if(error) {
          log.functionError(COLLECTION, 'getMaxRank', logData.parentProcess, logData.username,
            'Failed to find max rank for skill: ' + skill + '. Error: ' + error);
        }
        var maxRank = data[0].subSkills[0].rank;
        log.functionCall(COLLECTION, 'getMaxRank', logData.parentProcess, logData.username, {'skill':skill});

        callback(maxRank);
      });
    }
  };

  AUGEO_USER.statics.getNumberUsers = function(logData, callback) {
    this.count({},function(error, count) {
      if(error) {
        log.functionError(COLLECTION, 'getNumberUsers', logData.parentProcess, logData.username,
          'Failed to get the number of users. Error: + ' + error);
      } else {
        log.functionCall(COLLECTION, 'getNumberUsers', logData.parentProcess, logData.username);
        callback(count);
      }
    });
  };

  AUGEO_USER.statics.getPasswordWithEmail = function(email, logData, callback) {
    this.findOne({email:{'$regex': AugeoUtility.buildRegex(email, logData), $options: 'i'}}, {password:1}, function(error, data) {
      if(error) {
        log.functionError(COLLECTION, 'getPasswordWithEmail', logData.parentProcess, logData.username,
          'Failed to find password for email: ' + email + '. Error:' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getPasswordWithEmail', logData.parentProcess, logData.username, {'email':email});
        if(data && data.password) {
          callback(data.password)
        } else {
          callback();
        }
      }
    });
  };

  AUGEO_USER.statics.getPasswordWithUsername = function(username, logData, callback) {
    this.findOne({username:{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}}, {password:1}, function(error, data) {
      if(error) {
        log.functionError(COLLECTION, 'getPasswordWithUsername', logData.parentProcess, logData.username,
          'Failed to find password for username: ' + username + '. Error:' + error);
        callback();
      } else {
        log.functionCall(COLLECTION, 'getPasswordWithUsername', logData.parentProcess, logData.username, {'username':username});
        if(data && data.password) {
          callback(data.password)
        } else {
          callback();
        }
      }
    });
  };

  AUGEO_USER.statics.getSkillRank = function(username, skill, logData, callback) {

    if(skill === 'Augeo') {

      this.findOne({'username':{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}}, {'skill.rank':1}, function(error, data) {

        if(error) {
          log.functionError(COLLECTION, 'getSkillRank', logData.parentProcess, logData.username,
            'Failed to find ' + username + ' rank for ' + skill + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getSkillRank', logData.parentProcess, logData.username, {'username':username,'skill':skill});
          var rank = data.skill.rank;

          callback(rank);
        }
      });

    } else {

      this.aggregate([
        {
          "$match":
          {
            "username": {'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}
          }
        },
        getSubSkillQuery(skill)
      ],
      function(error, data) {
        if(error) {
          log.functionError(COLLECTION, 'getSkillRank', logData.parentProcess, logData.username,
            'Failed to find ' + username + 'rank for skill: ' + skill + '. Error: ' + error);
        }
        log.functionCall(COLLECTION, 'getSkillRank', logData.parentProcess, logData.username, {'username':username,'skill':skill});
        callback(data[0].subSkills[0].rank);
      });
    }
  };

  AUGEO_USER.statics.getSubSkillRanks = function(skill, logData, callback) {
    this.aggregate([
        getSubSkillQuery(skill),
        {
          "$sort": { "subSkills.experience": -1 }
        }
      ],
      function(error,docs) {
        if(error) {
          log.functionError(COLLECTION, 'getSubSkillRanks', logData.parentProcess, logData.username,
            'Failed to get subSkill ranks for skill: ' + skill + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getSkillRank', logData.parentProcess, logData.username, {'skill':skill});
          callback(docs)
        }
      }
    );
  };

  AUGEO_USER.statics.getRanks = function(logData, callback) {
    this.find({}, '', {sort: {'skill.experience':-1}}, function(error, docs) {
      if(error) {
        log.functionError(COLLECTION, 'getRanks', logData.parentProcess, logData.username, 'Failed to get ranks. Error:' + error);
      } else {
        log.functionCall(COLLECTION, 'getRanks', logData.parentProcess, logData.username);
        callback(docs);
      }
    });
  };

  AUGEO_USER.statics.getUserPublicWithId = function(userId, logData, callback) {
    this.findOne({_id:userId})
      .select(AugeoUtility.USER_PROJECTION)
      .populate(AugeoUtility.USER_PROJECTION_ARRAY)
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'getUserPublicWithId', logData.parentProcess, logData.username, 'Failed to find user with id: ' + userId);
          callback();
        } else {
          log.functionError(COLLECTION, 'getUserPublicWithId', logData.parentProcess, logData.username, {'id': userId});
          callback(user);
        }
      });
  };

  AUGEO_USER.statics.getUserSecretWithUsername = function(username, logData, callback) {
    this.findOne({'username':{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}})
      .select('-password')
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'getUserSecretWithUsername', logData.parentProcess, logData.username,
            'Failed to retrieve user with secret info for username: ' + username);
        } else {
          log.functionCall(COLLECTION, 'getUserSecretWithUsername', logData.parentProcess, logData.username, {'username': username});
          callback(user);
        }
      });
  };

  AUGEO_USER.statics.getUserWithId = function(id, logData, callback) {
    this.findOne({_id: id}, function(error, user) {
      if(error) {
        log.functionError(COLLECTION, 'getUserWithId', logData.parentProcess, logData.username, 'Failed to find user with id: ' + id);
        callback();
      } else {
        log.functionError(COLLECTION, 'getUserWithId', logData.parentProcess, logData.username, {'id': id});
        callback(user);
      }
    });
  };

  AUGEO_USER.statics.getUserWithEmail = function(email, logData, callback) {
    this.findOne({email:{'$regex': AugeoUtility.buildRegex(email, logData), $options: 'i'}})
      .select(AugeoUtility.USER_PROJECTION)
      .populate(AugeoUtility.USER_PROJECTION_ARRAY)
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'getUserWithEmail', logData.parentProcess, logData.username,
            'Failed to retrieve ' + email + '. Error: ' + error);
        } else {
          log.functionCall(COLLECTION, 'getUserWithEmail', logData.parentProcess, logData.username, {'email':email});
          callback(user);
        }
      });
  };

  AUGEO_USER.statics.getUserWithUsername = function(username, logData, callback) {
    this.findOne({'username':{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}})
      .select()
      .populate(AugeoUtility.USER_PROJECTION_ARRAY)
      .exec(function(error, user) {
        if(error) {
          log.functionError(COLLECTION, 'getUserWithUsername', logData.parentProcess, logData.username,
            'Failed to retrieve ' + username + '. Error: ' + error);
          callback();
        } else {
          log.functionCall(COLLECTION, 'getUserWithUsername', logData.parentProcess, logData.username, {'username':username});
          callback(user);
        }
      });
  };

  AUGEO_USER.statics.remove = function(username, logData, callback) {
    this.findOneAndRemove({'username':{'$regex': AugeoUtility.buildRegex(username, logData), $options: 'i'}}, function(error, user) {
      if(error) {
        log.functionError(COLLECTION, 'remove', logData.parentProcess, logData.username, 'Failed to remove ' + username + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'remove', logData.parentProcess, logData.username, {'username':username});
        callback(user);
      }
    });
  };

  AUGEO_USER.statics.saveDocument = function(doc, logData, callback) {
    doc.save(function(error) {
      if(error) {
        log.functionError(COLLECTION, 'saveDocument', logData.parentProcess, logData.username, 'Failed to save USER document. ' + error);
      } else {
        log.functionCall(COLLECTION, 'saveDocument', logData.parentProcess, logData.username, {'doc.username':(doc)?doc.username:'invalid'});
        if(callback) {
          callback();
        }
      }
    });
  };

  AUGEO_USER.statics.saveProfileData = function(profileData, logData, callback) {

    var query = {username: profileData.username};
    var update = {
      $set:{
        "profession": profileData.profession,
        "location": profileData.location,
        "website": profileData.website,
        "description": profileData.description
      }
    };

    var options = {multi:false};

    this.update(query, update, options, function(error, n) {
      if(error) {
        log.functionError(COLLECTION, 'saveProfileData', logData.parentProcess, logData.username,
          'Failed to update profile data for: ' + (profileData)?profileData.username:'invalid' + '. Error: ' + error);
        callback(false);
      } else {
        log.functionCall(COLLECTION, 'saveProfileData', logData.parentProcess, logData.username,
          {'profileData.username':(profileData)?profileData.username:'invalid'});
        callback(true);
      }
    });
  };

  AUGEO_USER.statics.setProfileImage = function(username, profileImg, profileIcon, logData, callback) {

    var query = {username: username};
    var update = {
      $set:{
        "profileImg": profileImg,
        "profileIcon": profileIcon
      }
    };

    var options = {multi:false};

    this.update(query, update, options, function(error, n) {
      if(error) {
        log.functionError(COLLECTION, 'setProfileImage', logData.parentProcess, logData.username,
          'Failed to update profile image for: ' + username + '. Error: ' + error);
        callback(false);
      } else {
        log.functionCall(COLLECTION, 'setProfileImage', logData.parentProcess, logData.username, {'username':username});
        callback(true);
      }
    });
  };

  AUGEO_USER.statics.updateSubSkillRank = function(doc, rank, index, logData, callback) {

    var setModifier = { $set: {} };
    setModifier.$set['subSkills.' + index + '.rank'] = Math.round(rank);

    this.update({_id: doc._id}, setModifier, function(error, n) {

      var skillName = 'invalid';
      if(doc && doc.subSkills[0] && doc.subSkills[0].name) {
        skillName = doc.subSkills[0].name;
      }

      if(error) {
        log.functionError(COLLECTION, 'updateSubSkillRank', logData.parentProcess, logData.username,
          'Failed to update ' + skillName + ' rank. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'updateSubSkillRank', logData.parentProcess, logData.username, {'skill':skillName,'rank':rank});
        if(callback) {
          callback(n);
        }
      }
    });
  };

  AUGEO_USER.statics.updateSkillData = function(id, experience, logData, callback) {
    this.findOne({_id:id}, function(error, doc) {

      if(error) {
        log.functionError(COLLECTION, 'updateSkillData', logData.parentProcess, logData.username,
          'Error when trying to find user with ID: ' + id + '. Error: ' + error);
      } else {
        log.functionCall(COLLECTION, 'updateSkillData', logData.parentProcess, logData.username, {'id':id});

        if(doc) {
          doc.skill.experience += experience.mainSkillExperience;
          doc.skill.level = AugeoUtility.calculateLevel(doc.skill.experience, logData);
          doc.subSkills.forEach(function(subSkill){
            subSkill.experience += experience.subSkillsExperience[subSkill.name];
            subSkill.level = AugeoUtility.calculateLevel(subSkill.experience, logData);
          });
          doc.save(function(error) {
            if(error) {
              log.functionError(COLLECTION, 'updateSkillData', logData.parentProcess, logData.username,
                'Failed to save experience. Error: ' + error);
            } else {
              log.functionCall(COLLECTION, 'updateSkillData', logData.parentProcess, logData.username,
                {'mainSkillExperience':(experience)?experience.mainSkillExperience:'invalid',
                  'subSkillExperience':(experience && experience.subSkillsExperience)?'defined':'invalid'});
              callback();
            }
          });
        } else {
          log.functionError(COLLECTION, 'updateSkillData', logData.parentProcess, logData.username,
            'Failed to find user with ID: ' + id + '.');
          callback();
        }
      }
    });
  };

  /***************************************************************************/
  /* Private Methods                                                         */
  /***************************************************************************/

  var getSubSkillQuery = function(skill) {

      var subSkillQuery =
        { "$project": // Specifies the fields to be returned
          {
              "subSkills": {
                  "$setDifference": [ // Relative compliment of the second set relative to the first
                      { "$map": // Applies an expression to each item in an array and returns an array with the applied results
                        {
                            "input": "$subSkills", // Expression that resolves to an array
                            "as": "subSkill", // The variable name for the items in the input array
                            "in": { // The expression to apply to each item in the input array
                              "$cond": [ // Evaluates a boolean expression to return one of the two specified return expressions {if expression, then, else}
                                { "$eq": ["$$subSkill.name", skill] },  // If the subSkill name does not equal the intended skill name set the array element to false
                                "$$subSkill",
                                false
                              ]
                            }
                        }
                      },
                      [false] // Only subSkills with the matched subskill will be returned
                  ]
              }
          }
        };

        return subSkillQuery;
  };

  // Declare model
  module.exports = AugeoDB.model('AUGEO_USER', AUGEO_USER);
