
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
  /* Description: Logic for USER database collection                         */
  /***************************************************************************/

  // Required libraries
  var Mongoose = require('mongoose');
  var Schema = Mongoose.Schema;

  // Required local modules
  var AugeoDB = require('../database');
  var Logger = require('../../module/logger');
  var AugeoUtility = require('../../utility/augeo-utility');

  // Global variables
  var log = new Logger();
  var clientSafeProjection = {
    'firstName': 1,
    'lastName': 1,
    'username': 1,
    'profileImg': 1,
    'profileIcon': 1,
    'profession': 1,
    'location': 1,
    'website': 1,
    'description': 1,
    'twitter.twitterId': 1,
    'twitter.name': 1,
    'twitter.screenName': 1,
    'twitter.profileImageUrl': 1,
    'twitter.isMember': 1,
    'twitter.skill': 1,
    'twitter.subSkills': 1
  };

  // Schema declaration
  var USER = Mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    password: String,
    sendGridId: String,
    profileImg: String,
    profileIcon: String,
    profession: String,
    location: String,
    website: String,
    description: String,
    twitter: {
      twitterId: String,
      name: String,
      screenName: String,
      profileImageUrl: String,
      accessToken: String,
      secretAccessToken:String,
      secretToken:String,
      isMember: Boolean,
      skill: {
        imageSrc: String,
        imageLink: String,
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
      }]
    }
  });

  /***************************************************************************/
  /* Static Methods: Accessible at Model level                               */
  /***************************************************************************/

  USER.statics.add = function(user, callback) {
    this.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: user.password,
      sendGridId: user.sendGridId,
      profileImg: user.profileImg,
      profileIcon: user.profileIcon,
      profession: '',
      location: '',
      website: '',
      description: '',
    }, function(error, pUser) {
      if(error) {
        log.warn('Failed to add ' + user.email + ' to USER collection: ' + error);
      } else {
        log.info('Successfully added ' + user.email + ' to USER collection');
        callback(pUser);
      }
    });
  };

  USER.statics.addSecretToken = function(id, secretToken, callback) {
    return this.findOne({_id:id}, function(error, doc) {
      var success = false;

      if(error) {
        log.warn('Failed to find user with id:' + id + ' to add secret token. ' + error);
        callback(success);
      } else {
        log.info('Successfully found user with id:' + id + ' to add secret token');

        doc.twitter.secretToken = secretToken;
        doc.save(function(error) {
          if(error) {
            log.warn('Failed to set secret token for user with id:' + id + '. ' + error);
            callback(success)
          } else {
            log.info('Successfully set secret token for user with id:' + id);
            success = true;
            callback(success);
          }
        });
      }
    })
  };

  USER.statics.checkExistingAccessToken = function(accessToken, callback) {
    return this.count({'twitter.accessToken':accessToken}, function(error, count) {
      if(error) {
        log.warn('Failed to find count for access token:' + accessToken + ' from USER collection: ' + error);
        callback();
      } else {

        var accessTokenExists = false;
        if(count > 0) {
          accessTokenExists = true;
        }

        log.info('Successfully checked if accessToken:' + accessToken + ' exists in USER collection');
        callback(accessTokenExists);
      }
    });
  };

  USER.statics.checkExistingTwitterUser = function(screenName, callback) {
    this.count({'twitter.screenName':screenName}, function(error, count) {
      if(error) {
        log.warn('Failed to check if Twitter screen name exists ' + screenName + '. Error: ' + error);
      } else {
        log.info('Successfully checked if ' + screenName + ' exists in USER collection.');
        var userExists = false;
        if(count > 0) {
          userExists = true;
        }
        callback(userExists);
      }
    });
  };

  USER.statics.doesEmailExist = function(email, callback) {
    var emailExists = false;
    return this.count({email:{'$regex': email, $options: 'i'}}, function(error, count) {
      if(error) {
        log.warn('Failed to find count for ' + email + ' from USER collection: ' + error);
      } else {
        log.info('Successfully checked if ' + email + ' exists in USER collection');
        if(count > 0) {
          emailExists = true;
        }
      }
      callback(emailExists);
    });
  };

  USER.statics.doesUsernameExist = function(username, callback) {
    var usernameExists = false;
    this.count({'username':{'$regex': username, $options: 'i'}}, function(error, count) {
      if(error) {
        log.warn('Failed to check if username: ' + username + ' exists. Error: ' + error);
      } else {
        log.info('Successfully checked if username: ' + username + ' exists');
        if(count > 0) {
          usernameExists = true;
        }
      }
      callback(usernameExists);
    });
  };

  USER.statics.getAllUsersTwitterQueueData = function(callback) {
    return this.find({}, '_id twitter.screenName twitter.accessToken twitter.secretAccessToken', function(error, users) {
      if(error) {
        log.warn('Failed to retrieve users queue data');
      } else {
        log.info('Successfully retrieved users queue data');
        callback(users);
      }
    });
  };

  USER.statics.getCompetitorsInPage = function(skill, startRank, endRank, callback) {

    if(skill === 'Twitter') {

      this.find(
        { // Get users where rank is >= startRank and <= endRank
          'twitter.skill.rank': {$gte:startRank, $lte:endRank}
        },
        { // Specify attributes to return
          'username': 1,
          'twitter.screenName':1,
          'twitter.skill.rank':1,
          'twitter.skill.level':1,
          'twitter.skill.experience':1
        },
        {
          sort: {
            'twitter.skill.rank':1
          }
        },
        function(error, competitors) {
          if(error) {
            log.warn('Failed to get competitors in page for skill: ' + skill + '. Error: ' + error);
          } else {
            log.info('Successfully retrieved competitors in page for skill: ' + skill);
            callback(competitors);
          }
        });
    } else {

      // Build query
      var fields = getSubSkillQuery(skill);
      fields.$project['username'] = 1;
      fields.$project['twitter.screenName'] = 1;

      this.aggregate([
        fields,
        {
          '$match':
          {
            "twitter.subSkills.rank": {$gte:startRank, $lte:endRank},
          }
        },
        {
          '$sort':
          {
            'twitter.subSkills.rank': 1,
          }
        }
      ],
      function(error, users) {
        if(error) {
          log.warn('Failed to find leaders for skill: ' + skill + '. Error: ' + error);
        }
        log.info('Successfully found leaders for skill: ' + skill);

        callback(users);
      });
    }
  };

  USER.statics.getMaxRank = function(skill, callback) {

    if(skill === 'Twitter') {
      // Find max rank
      this.find({},{'twitter.skill.rank':1}, {sort:{'twitter.skill.rank':-1}, limit:1}, function(error, data) {
        if(error) {
          log.warn('Failed to find max rank for skill ' + skill + '. Error: ' + error);
        } else {
          var maxRank = data[0].twitter.skill.rank;
          log.info('Successfully found max rank for skill ' + skill + '. MaxRank: ' + maxRank);
          callback(maxRank);
        }
      });
    } else {
      this.aggregate([
        getSubSkillQuery(skill),
        {
          "$sort": {
            "twitter.subSkills.rank": -1
          }
        },
        {
          "$limit" : 1
        }
      ],
      function(error, data) {
        if(error) {
          log.warn('Failed to find max rank for skill: ' + skill + '. Error: ' + error);
        }
        var maxRank = data[0].twitter.subSkills[0].rank;
        log.info('Successfully found max rank for skill ' + skill + '. MaxRank: ' + maxRank);

        callback(maxRank);
      });
    }
  };

  USER.statics.getNumberUsers = function(callback) {
    this.count({},function(error, count) {
      if(error) {
        log.warn('Failed to get the number of users. Error: + ' + error);
      } else {
        log.info('Successfully received the number of users. Number of users: ' + count);
        callback(count);
      }
    });
  };

  USER.statics.getPasswordWithEmail = function(email, callback) {
    this.findOne({email:{'$regex': email, $options: 'i'}}, {password:1}, function(error, data) {
      if(error) {
        log.warn('Failed to find password for email: ' + email + '. Error:' + error);
        callback();
      } else {
        log.info('Successfully retrieved password for email: ' + email);
        if(data && data.password) {
          callback(data.password)
        } else {
          callback();
        }
      }
    });
  };
  
  USER.statics.getPasswordWithUsername = function(username, callback) {
    this.findOne({username:{'$regex': username, $options: 'i'}}, {password:1}, function(error, data) {
      if(error) {
        log.warn('Failed to find password for username: ' + username + '. Error:' + error);
        callback();
      } else {
        log.info('Successfully retrieved password for username: ' + username);
        if(data && data.password) {
          callback(data.password)
        } else {
          callback();
        }
      }
    });
  };

  USER.statics.getSkillRank = function(username, skill, callback) {

    if(skill === 'Twitter') {

      this.findOne({'username':{'$regex': username, $options: 'i'}}, {'twitter.skill.rank':1}, function(error, data) {

        if(error) {
          log.warn('Failed to find ' + username + ' rank for ' + skill + '. Error: ' + error);
        } else {
          log.info('Successfully found ' + username + ' rank for ' + skill + '. Rank: ' + data);
          var rank = data.twitter.skill.rank;

          callback(rank);
        }
      });

    } else {

      this.aggregate([
        {
          "$match":
          {
            "username": {'$regex': username, $options: 'i'}
          }
        },
        getSubSkillQuery(skill)
      ],
      function(error, data) {
        if(error) {
          log.warn('Failed to find ' + username + 'rank for skill: ' + skill + '. Error: ' + error);
        }
        log.info('Successfully found ' + username + ' rank for skill ' + skill + '. Rank: ' + data[0].twitter.subSkills[0].rank);
        callback(data[0].twitter.subSkills[0].rank);
      });
    }
  };

  USER.statics.getSubSkillRanks = function(skill, callback) {
    this.aggregate([
        getSubSkillQuery(skill),
        {
          "$sort": { "twitter.subSkills.experience": -1 }
        }
      ],
      function(error,docs) {
        if(error) {
          log.warn('Failed to get subSkill ranks. Error: ' + error);
        } else {
          log.info('Successfully retrieved ' + skill + ' ranks');
          callback(docs)
        }
      }
    );
  };

  USER.statics.getTwitterTokens = function(id, callback) {
    return this.findOne({_id:id}, {'twitter.accessToken':1, 'twitter.secretAccessToken':1, 'twitter.secretToken':1}, function(error, data) {
      if(error) {
        log.warn('Failed to retrieve users access tokens with id:' + id + '. ' + error);
        callback();
      } else {
        log.info('Successfully retrieved users access tokens with id:'+ id);

        if(data) {
          var tokens = {
            accessToken: data.twitter.accessToken,
            secretAccessToken: data.twitter.secretAccessToken,
            secretToken: data.twitter.secretToken
          }
          callback(tokens);
        } else {
          callback();
        }
      }
    });
  };

  USER.statics.getTwitterRanks = function(callback) {
    return this.find({}, '', {sort: {'twitter.skill.experience':-1}}, function(error, docs) {
      if(error) {
        log.warn('Failed to update Twitter Ranks. Error:' + error);
      } else {
        log.info('Successfully updated Twitter Ranks');
        callback(docs);
      }
    });
  }

  USER.statics.getUsers = function(callback) {
    return this.find({}, 'twitter.twitterId', function(error, users) {
      if(error) {
        log.warn('Failed to retrieve users.');
      } else {
        log.info('Successfully retrieved users.');
        callback(users);
      }
    });
  };

  USER.statics.getUserWithEmail = function(email, callback) {
    return this.findOne({email:{'$regex': email, $options: 'i'}}, clientSafeProjection, function(error, user) {
      if(error) {
        log.warn('Failed to retrieve ' + email + ' from USER collection: ' + error);
      } else {
        log.info('Successfully retrieved ' + email + ' from USER collection');
        callback(user);
      }
    });
  };

  USER.statics.getUserWithId = function(id, callback) {
    return this.findOne({_id:id}, clientSafeProjection, function(error, user) {
      if(error) {
        log.warn('Failed to retrieve ' + id + ' from USER collection: ' + error);
      } else {
        log.info('Successfully retrieved ' + id + ' from USER collection');
        callback(user);
      }
    });
  };

  USER.statics.getUserWithScreenName = function(screenName, callback) {
    return this.findOne({'twitter.screenName':screenName}, clientSafeProjection, function(error, user) {
      if(error) {
        log.warn('Failed to retrieve ' + screenName + ' from USER collection: ' + error);
      } else {
        log.info('Successfully retrieved ' + screenName + ' from USER collection');
        callback(user);
      }
    });
  };

  USER.statics.getUserWithTwitterId = function(twitterId, callback) {
    return this.findOne({'twitter.twitterId':twitterId}, clientSafeProjection, function(error, user) {
      if(error) {
        log.warn('Failed to retrieve ' + twitterId + ' from USER collection: ' + error);
      } else {
        log.info('Successfully retrieved ' + twitterId + ' from USER collection');
        callback(user);
      }
    });
  };

  USER.statics.getUserWithUsername = function(username, callback) {
    return this.findOne({'username':{'$regex': username, $options: 'i'}}, clientSafeProjection, function(error, user) {
      if(error) {
        log.warn('Failed to retrieve ' + username + ' from USER collection: ' + error);
      } else {
        log.info('Successfully retrieved ' + username + ' from USER collection');
        callback(user);
      }
    });
  };

  USER.statics.isMember = function(id, callback) {

    return this.count({'_id':id, 'twitter.isMember':true}, function(error, count) {
      var isMember = false;
      if(error) {
        log.warn('Failed to check if user with id: ' + id + ' is a member. ERROR: ' + error);
      } else {
        if(count > 0) {
          log.info('Successfully checked that user with id: ' + id + ' is a member');
          isMember = true;
        } else {
          log.info('Successfully checked that user with id: ' + id + ' is NOT a member');
        }
      }
      callback(isMember);
    });
  };

  USER.statics.remove = function(username, callback) {
    this.findOneAndRemove({'username':{'$regex': username, $options: 'i'}}, function(error, user) {
      if(error) {
        log.warn('Failed to remove ' + username + ' from USERS. Error: ' + error);
      } else {
        log.info('Successfully removed user ' + username + ' from the database.');
        callback(user);
      }
    });
  };

  USER.statics.saveDocument = function(doc, callback) {
    doc.save(function(error) {
      if(error) {
        log.warn('Failed to save USER document. ' + error);
      } else {
        log.info('Sucessfully saved USER document.');
        if(callback) {
          callback();
        }
      }
    });
  };

  USER.statics.saveProfileData = function(profileData, callback) {

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

    return this.update(query, update, options, function(error, n) {
      if(error) {
        log.warn('Failed to update profile data: ' + error);
        callback(false);
      } else {
        log.info('Successfully updated profile data');
        callback(true);
      }
    });
  };

  USER.statics.setMember = function(id, callback) {
    return this.findOne({_id:id}, function(error, doc) {

      if(error) {
        log.warn('Failed to find user with id:' + id + ' to set as a member. ' + error);
        callback(false);
      } else {
        log.info('Successfully found user with id:' + id + ' to set as a member');
        if(doc) {
          doc.twitter.isMember = true;
          doc.save(function(error) {
            if(error) {
              log.warn('Failed to set member for user with id:' + id + '. ' + error);
              callback(false);
            } else {
              log.info('Successfully set member for user with id:' + id);
              callback(true);
            }
          });
        } else {
          callback(false);
        }
      }
    })
  };

  USER.statics.updateSubSkillRank = function(doc, rank, index, callback) {

    var setModifier = { $set: {} };
    setModifier.$set['twitter.subSkills.' + index + '.rank'] = Math.round(rank);

    this.update({_id: doc._id}, setModifier, function(error, n) {
      if(error) {
        log.info('Failed to update ' + doc.twitter.subSkills[0].name + ' rank. Error: ' + error);
      } else {
        log.info('Successfully updated ' + doc.twitter.subSkills[0].name + ' rank');
        if(callback) {
          callback(n);
        }
      }
    });
  };

  USER.statics.updateTwitterInfo = function(id, data, callback) {

    if(data.subSkills == null) {
      data.subSkills = new Array();
    }

    var query = {_id:id};
    var update = {
                    $set:{
                      "profileImg": data.profileImageUrl,
                      "profileIcon": data.profileIcon,
                      "twitter.accessToken": data.accessToken,
                      "twitter.secretAccessToken": data.secretAccessToken,
                      "twitter.twitterId": data.twitterId,
                      "twitter.name": data.name,
                      "twitter.screenName": data.screenName,
                      "twitter.profileImageUrl": data.profileImageUrl,
                      "twitter.isMember": data.isMember,
                      "twitter.skill": data.skill,
                      "twitter.subSkills": data.subSkills
                    }
                 };

    var options = {multi:false};

    return this.update(query, update, options, function(error, n) {
      if(error) {
        log.warn('Failed to update Twitter data in USER collection: ' + error);
      } else {
        log.info('Successfully updated ' + n + ' documents in USER collection.');
        callback();
      }
    });
  };

  USER.statics.updateTwitterSkillData = function(id, experience, callback) {
    var collection = this;
    return this.findOne({_id:id}, function(error, doc) {

      if(error) {
        log.warn('Failed to find user in USER collection to update Twitter experience: ' + error);
      } else {
        log.info('Successfully found user with id:' + id + ' to update Twitter experience .');

        doc.twitter.skill.experience += experience.mainSkillExperience;
        doc.twitter.skill.level = AugeoUtility.calculateLevel(doc.twitter.skill.experience);
        doc.twitter.subSkills.forEach(function(subSkill){
          subSkill.experience += experience.subSkillsExperience[subSkill.name];
          subSkill.level = AugeoUtility.calculateLevel(subSkill.experience);
        });
        doc.save(function(error) {
          if(error) {
            log.warn('Failed to save Twitter experience in USER collection: ' + error);
          } else {
            log.info('Sucessfully saved Twitter experience in USER collection');
            callback();
          }
        });
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
              "twitter.subSkills": {
                  "$setDifference": [ // Relative compliment of the second set relative to the first
                      { "$map": // Applies an expression to each item in an array and returns an array with the applied results
                        {
                            "input": "$twitter.subSkills", // Expression that resolves to an array
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
  var User = module.exports = AugeoDB.model('User', USER);
