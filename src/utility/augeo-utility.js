
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
  /* Description: Augeo utility functions                                    */
  /***************************************************************************/

  // Required local modules
  var Logger = require('../module/logger');

  // Constants
  var LEVEL_MULTIPLIER = 30;
  var UTILITY = 'augeo-utility';

  // Global variables
  var log = new Logger();

  exports.SUB_SKILLS = [{name:"Books", glyphicon:"glyphicon-book"}, {name:"Business", glyphicon:"glyphicon-briefcase"}, {name:"Community", glyphicon:"glyphicon-tree-deciduous"},
    {name:"Entertainment", glyphicon:"glyphicon-star"}, {name:"Fitness", glyphicon:"glyphicon-heart"}, {name:"Food & Drink", glyphicon:"glyphicon-cutlery"},
    {name:"Games", glyphicon:"glyphicon-tower"}, {name:"General", glyphicon:"glyphicon-globe"}, {name:"Music", glyphicon:"glyphicon-headphones"},
    {name:"Photography", glyphicon:"glyphicon-camera"}, {name:"Sports", glyphicon:"glyphicon-bullhorn"}, {name:"Technology", glyphicon:"glyphicon-phone"}];

  // Calculate level depending on the amount of experience
  exports.calculateLevel = function(experience, logData) {
    log.functionCall(UTILITY, 'calculateLevel', logData.parentProcess, logData.username, {'experience':experience});

    var level = 1;
    if(typeof experience === 'number' && experience > 0) {
      var fourAC = 4*LEVEL_MULTIPLIER*experience;
      var bSquared = LEVEL_MULTIPLIER*LEVEL_MULTIPLIER;
      var root = Math.sqrt(bSquared + fourAC);
      var numerator = root - LEVEL_MULTIPLIER;
      var denominator = LEVEL_MULTIPLIER*2;

      level = Math.floor(numerator/denominator) + 1; // Add 1 to level since levels start at 1
    }

    return level;
  }

  // Calculate the progress of a level
  exports.calculateLevelProgress = function(level, experience, logData) {
    log.functionCall(UTILITY, 'calculateLevelProgress', logData.parentProcess, logData.username, {'level':level,'experience':experience});

    level = typeof level !== 'number' ? 1 : level;
    level = level < 1 ? 1 : level;

    var levelProgress = 0;
    if(typeof experience == 'number' && experience > 0) {
      var startExperience = exports.getLevelStartExperience(level, logData);
      var relativeExperience = experience - startExperience;
      var endExperience = exports.getLevelEndExperience(level, logData);
      var difference = endExperience - startExperience;
      levelProgress = Math.floor((relativeExperience/difference)*100)/100;
    }

    return levelProgress;
  };

  // Calculate skills experience
  exports.calculateSkillsExperience = function(activities, logData) {
    log.functionCall(UTILITY, 'calculateSkillsExperience', logData.parentProcess, logData.username, {'activities.length':(activities)?activities.length:'invalid'});

    var mainSkillExperience = 0;
    var subSkillsExperience = exports.initializeSubSkillsExperienceArray(exports.SUB_SKILLS, logData);
    for(var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var duplicateExperience = (activity.duplicateExperience) ? activity.duplicateExperience : 0;

      // Add tweet experience to mainSkill
      mainSkillExperience += (activity.experience - duplicateExperience);

      // Add experience to subSkill
      subSkillsExperience[activity.classification] += (activity.experience - duplicateExperience);
    }

    var experience = {
      mainSkillExperience: mainSkillExperience,
      subSkillsExperience: subSkillsExperience
    };

    return experience;
  };

  // Create user's sub skills given the sub skills experience
  exports.createSubSkills = function(skillsExperience, logData) {
    log.functionCall(UTILITY, 'createSubSkills', logData.parentProcess, logData.username, {'skillsExperience':(skillsExperience)?'defined':'invalid'});

    var updatedSkillsArray = new Array();

    skillsExperience = skillsExperience === undefined ? new Array() : skillsExperience;
    skillsExperience = skillsExperience.constructor !== Array ? new Array() : skillsExperience;
    for(var i = 0; i < exports.SUB_SKILLS.length; i++) {
      var skill = exports.SUB_SKILLS[i];
      var skillName = skill.name;
      var experience = skillsExperience[skillName];

      experience = typeof experience !== 'number' ? 0 : experience;
      experience = experience < 0 ? 0 : experience;

      var updatedSkill = {
        name: skillName,
        glyphicon: skill.glyphicon,
        experience: experience,
        level: exports.calculateLevel(experience, logData),
        rank:0
      };

      updatedSkillsArray.push(updatedSkill);
    }

    return updatedSkillsArray;
  };

  exports.formatLogData = function(parentProcess, username) {
    return {
      'parentProcess': parentProcess,
      'username': username
    };
  };

  exports.getDateParts = function(dateString, logData) {
      log.functionCall(UTILITY, 'getDateParams', logData.parentProcess, logData.username, {'dateString':dateString});

      var dateParts;
      if(typeof dateString == 'string') {
          var dateArray = dateString.split(/-/);
          if(dateArray.length == 3) {
            dateParts = dateArray;
          }
      }

      return {
        year: (dateParts) ? parseInt(dateParts[0]) : 1970,
        month: (dateParts) ? parseInt(dateParts[1], 10) -1 : 0,
        day: (dateParts) ? parseInt(dateParts[2]) : 1
      };
  };

  // Return the glyphicon for the given skill
  exports.getGlyphicon = function(name, logData) {
    log.functionCall(UTILITY, 'getGlyphicon', logData.parentProcess, logData.username, {'name':name});
    var glyphicon = '';
    for(var i = 0; i < exports.SUB_SKILLS.length; i++) {
      if(exports.SUB_SKILLS[i].name === name) {
        glyphicon = exports.SUB_SKILLS[i].glyphicon;
        break;
      }
    }
    return glyphicon;
  };

  // Get the end experience of the given level
  exports.getLevelEndExperience = function(level, logData) {
    log.functionCall(UTILITY, 'getLevelEndExperience', logData.parentProcess, logData.username, {'level':level});
    var endExperience = 0;
    if(typeof level === 'number' && level > 0) {
      endExperience = (LEVEL_MULTIPLIER*(level))*((level)+1);
    }
    return endExperience;
  };

  // Get the start experience of the given level
  exports.getLevelStartExperience = function(level, logData) {
    log.functionCall(UTILITY, 'getLevelStartExperience', logData.parentProcess, logData.username, {'level':level});
    var startExperience = 0;
    if(typeof level === 'number' && level > 0) {
      startExperience = (LEVEL_MULTIPLIER*(level-1))*((level-1)+1);
    }
    return startExperience;
  };

  // Get the main skill display data
  exports.getMainSkill = function(experience, logData) {
    log.functionCall(UTILITY, 'getMainSkill', logData.parentProcess, logData.username, {'experience':experience});
    return {
      imageSrc: 'image/augeo-logo-medium.png',
      level: exports.calculateLevel(experience, logData),
      experience: experience,
      rank: 0
    };
  };

  // Get the index of the skill given the skill name
  exports.getSkillIndex = function(skill, logData) {
    log.functionCall(UTILITY, 'getSkillIndex', logData.parentProcess, logData.username, {'skill':skill});
    var index = -1;
    for(var i = 0; i < exports.SUB_SKILLS.length; i++) {
      if(exports.SUB_SKILLS[i].name === skill) {
        index = i;
      }
    }
    return index;
  };

  // Return an array with all subSkills set to 0
  exports.initializeSubSkillsExperienceArray = function(subSkills, logData) {
    log.functionCall(UTILITY, 'initializeSubSkillsExperienceArray', logData.parentProcess, logData.username, {'subSkills':(subSkills)?'defined':'invalid'});

    var subSkillsExperience = {};

    if(subSkills) {
      subSkills = subSkills.constructor !== Array ? new Array() : subSkills;
      for(var i = 0; i < subSkills.length; i++) {
        subSkillsExperience[subSkills[i].name] = 0;
      }
    }
    return subSkillsExperience;
  };

  // Remove first element from array
  exports.trimArray = function(array, logData) {
    log.functionCall(UTILITY, 'trimArray', logData.parentProcess, logData.username, {'array':(array)?'defined':'invalid'});

    var trimmedArray = new Array();

    if(array) {
      array = array.constructor !== Array ? new Array() : array;
      for(var i = 1; i < array.length;i++) {
        trimmedArray[i-1] = array[i];
      }
    }

    return trimmedArray;
  };
