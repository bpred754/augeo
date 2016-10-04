
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
  var Logger = require('../module/logger');

  // Private Constants
  var UTILITY = 'twitter-utility';

  // Public Constants
  exports.TWEET_EXPERIENCE = 10;
  exports.MENTION_EXPERIENCE = 10;
  exports.RETWEET_EXPERIENCE = 0;
  exports.FAVORITE_EXPERIENCE = 0;
  exports.HASH_TAGS = ["augeoBooks","augeoBusiness","augeoEntertainment","augeoFood&Drink","augeoGeneral","augeoMusic","augeoPhotography","augeoSports","augeoTechnology"];

  // Global variables
  var log = new Logger();

  // Calculates the experience that will be awarded to a tweet
  exports.calculateTweetExperience = function(retweetCount, favoriteCount, logData) {
    log.functionCall(UTILITY, 'calculateTweetExperience', logData.parentProcess, logData.username, {'retweetCount':retweetCount,'favoriteCount':favoriteCount});

    retweetCount = typeof retweetCount != 'number' ? 0 : retweetCount;
    retweetCount = retweetCount < 0 ? 0 : retweetCount;

    favoriteCount = typeof favoriteCount != 'number' ? 0 : favoriteCount;
    favoriteCount = favoriteCount < 0 ? 0 : favoriteCount;

    return exports.TWEET_EXPERIENCE + (retweetCount*exports.RETWEET_EXPERIENCE) + (favoriteCount*exports.FAVORITE_EXPERIENCE);
  };

  // Determines if a tweet contains an augeo specific hashtag
  exports.containsAugeoHashtag = function(obj, logData) {
    log.functionCall(UTILITY, 'containsAugeoHashtag', logData.parentProcess, logData.username, {'obj':obj});

    var contains = false;
    if(obj) {
      var i = exports.HASH_TAGS.length;
      while (i--) {
        if (exports.HASH_TAGS[i] === obj) {
          contains = true;
          break;
        }
      }
    }
    return contains;
  };

  // Returns the amount of experience to be awarded to the given tweet
  exports.getExperience = function(tweet, screenName, isRetweet, logData) {
    log.functionCall(UTILITY, 'getExperience', logData.parentProcess, logData.username, {'tweet.experience':(tweet)?tweet.experience:'invalid',
      'screenName':screenName,'isRetweet':isRetweet});

    var experience = 0;
    if(tweet && tweet.screenName && tweet.experience) {
      if(isRetweet) {
        if(isRetweet === true) {
          experience = exports.RETWEET_EXPERIENCE;
        }
      } else if(tweet.screenName === screenName) {
        experience = tweet.experience;
      } else {  // If the tweet screen name does not match the user's screen name, then the tweet is a mention
        experience = exports.MENTION_EXPERIENCE;
      }
    }
    return experience;
  };
