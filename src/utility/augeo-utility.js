
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

  // Constants
  var LEVEL_MULTIPLIER = 30;

  // Calculate level depending on the amount of experience
  exports.calculateLevel = function(experience) {

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
  exports.calculateLevelProgress = function(level, experience) {

    level = typeof level !== 'number' ? 1 : level;
    level = level < 1 ? 1 : level;

    var levelProgress = 0;
    if(typeof experience == 'number' && experience > 0) {
      var startExperience = exports.getLevelStartExperience(level);
      var relativeExperience = experience - startExperience;
      var endExperience = exports.getLevelEndExperience(level);
      var difference = endExperience - startExperience;
      levelProgress = Math.floor((relativeExperience/difference)*100);
    }

    return levelProgress;
  };

  // Return an array with all subskills set to 0
  exports.initializeSubSkillsExperienceArray = function(subSkills) {

    var subSkillsExperience = new Array();

    if(subSkills) {
      subSkills = subSkills.constructor !== Array ? new Array() : subSkills;
      for(var i = 0; i < subSkills.length; i++) {
        subSkillsExperience[subSkills[i].name] = 0;
      }
    }
    return subSkillsExperience;
  }

  // Get the end experience of the given level
  exports.getLevelEndExperience = function(level) {
    var endExperience = 0;
    if(typeof level === 'number' && level > 0) {
      endExperience = (LEVEL_MULTIPLIER*(level))*((level)+1);
    }
    return endExperience;
  };

  // Get the start experience of the given level
  exports.getLevelStartExperience = function(level) {
    var startExperience = 0;
    if(typeof level === 'number' && level > 0) {
      startExperience = (LEVEL_MULTIPLIER*(level-1))*((level-1)+1);
    }
    return startExperience;
  };

  // Remove first element from array
  exports.trimArray = function(array) {

    var trimmedArray = new Array();

    if(array) {
      array = array.constructor !== Array ? new Array() : array;
      for(var i = 1; i < array.length;i++) {
        trimmedArray[i-1] = array[i];
      }
    }

    return trimmedArray;
  }
