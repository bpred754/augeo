
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
  /* Description: Twitter utility functions                                  */
  /***************************************************************************/

  // Required local modules
  var AugeoUtility = require('./augeo-utility');

  // Constants
  var TWEET_EXPERIENCE = 30;
  var MENTION_EXPERIENCE = 30;
  var RETWEET_EXPERIENCE = 50;
  var FAVORITE_EXPERIENCE = 50;

  var SUB_SKILLS = [{name:"Books", glyphicon:"glyphicon-book"}, {name:"Business", glyphicon:"glyphicon-briefcase"}, {name:"Film", glyphicon:"glyphicon-film"},
                    {name:"Food & Drink", glyphicon:"glyphicon-cutlery"}, {name:"General", glyphicon:"glyphicon-globe"}, {name:"Music", glyphicon:"glyphicon-headphones"},
                    {name:"Photography", glyphicon:"glyphicon-camera"}, {name:"Sports", glyphicon:"glyphicon-bullhorn"}, {name:"Technology", glyphicon:"glyphicon-phone"}];

  var HASH_TAGS = ["augeoBooks","augeoBusiness","augeoFilm","augeoFood&Drink","augeoGeneral","augeoMusic","augeoPhotography","augeoSports","augeoTechnology"];

  // Calculates the experience that will be awarded to a tweet
  exports.calculateTweetExperience = function(retweetCount, favoriteCount) {

    retweetCount = typeof retweetCount != 'number' ? 0 : retweetCount;
    retweetCount = retweetCount < 0 ? 0 : retweetCount;

    favoriteCount = typeof favoriteCount != 'number' ? 0 : favoriteCount;
    favoriteCount = favoriteCount < 0 ? 0 : favoriteCount;

    return TWEET_EXPERIENCE + (retweetCount*RETWEET_EXPERIENCE) + (favoriteCount*FAVORITE_EXPERIENCE);
  };

  // Create user's sub skills given the sub skills experience
  exports.createSubSkills = function(skillsExperience) {

    var updatedSkillsArray = new Array();

    skillsExperience = skillsExperience === undefined ? new Array() : skillsExperience;
    skillsExperience = skillsExperience.constructor !== Array ? new Array() : skillsExperience;
    for(var i = 0; i < SUB_SKILLS.length; i++) {
      var skill = SUB_SKILLS[i];
      var skillName = skill.name;
      var experience = skillsExperience[skillName];

      experience = typeof experience !== 'number' ? 0 : experience;
      experience = experience < 0 ? 0 : experience;

      var updatedSkill = {
        name: skillName,
        glyphicon: skill.glyphicon,
        experience: experience,
        level: AugeoUtility.calculateLevel(experience),
        rank:0
      }

      updatedSkillsArray.push(updatedSkill);
    }

    return updatedSkillsArray;
  };

  // Determines if a tweet contains an augeo specific hashtag
  exports.containsAugeoHashtag = function(obj) {

    var contains = false;
    if(obj) {
      var i = HASH_TAGS.length;
      while (i--) {
        if (HASH_TAGS[i] === obj) {
          contains = true;
          break;
        }
      }
    }
    return contains;
  };

  // Returns the amount of experience to be awarded to the given tweet
  exports.getExperience = function(tweet, screenName, isRetweet) {
    var experience = 0;
    if(tweet && tweet.screenName && tweet.experience) {
      if(isRetweet) {
        if(isRetweet === true) {
          experience = RETWEET_EXPERIENCE;
        }
      } else if(tweet.screenName === screenName) {
        experience = tweet.experience;
      } else {  // If the tweet screen name does not match the user's screen name, then the tweet is a mention
        experience = MENTION_EXPERIENCE;
      }
    }
    return experience;
  };

  // Return the glyphicon for the given skill
  exports.getGlyphicon = function(name) {
    var glyphicon = '';
    for(var i = 0; i < SUB_SKILLS.length; i++) {
      if(SUB_SKILLS[i].name === name) {
        glyphicon = SUB_SKILLS[i].glyphicon;
        break;
      }
    }
    return glyphicon;
  };

  // Get the main skill display data
  exports.getMainSkill = function(experience) {
    return {
      imageSrc: 'image/twitter/logo-blue-medium.png',
      imageLink: 'https://www.twitter.com',
      level: AugeoUtility.calculateLevel(experience),
      experience: experience,
      rank: 0
    };
  }

  // Get the index of the skill given the skill name
  exports.getSkillIndex = function(skill) {
    var index = -1;
    for(var i = 0; i < SUB_SKILLS.length; i++) {
      if(SUB_SKILLS[i].name === skill) {
        index = i;
      }
    }
    return index;
  };

  /***************************************************************************/
  /* Getter Funtions                                                         */
  /***************************************************************************/

  exports.getFavoriteExperience = function() {
    return FAVORITE_EXPERIENCE;
  };

  exports.getHashTags = function() {
    return HASH_TAGS;
  };

  exports.getMentionExperience = function() {
    return MENTION_EXPERIENCE;
  };

  exports.getRetweetExperience = function() {
    return RETWEET_EXPERIENCE;
  };

  exports.getSubSkills = function() {
    return SUB_SKILLS;
  };

  exports.getTweetExperience = function() {
    return TWEET_EXPERIENCE;
  };
