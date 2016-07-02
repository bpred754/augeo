
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
  /* Description: Singleton that contains logic for activity controllers     */
  /***************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function() {

    this.formatTweet = function(inTweet) {

      var tweet = JSON.parse(JSON.stringify(inTweet));
      var html = tweet.text;

      // Check if tweet contains mentions
      if(tweet.mentions.length > 0) {
        var mentions = tweet.mentions;

        // Convert twitter mentions into href links
        for(var j = 0; j < mentions.length; j++) {
          var mention = mentions[j].screen_name;
          html = html.replace('@' + mention, '<a href="https://www.twitter.com/' + mention + '" class="clickable" style="color:#0084B4" target="_blank">' + '@' + mention + '</a>');
        }
      }

      // Check if tweet contains hashtags
      if(tweet.hashtags.length > 0) {
        var hashtags = tweet.hashtags;

        // Convert twitter hashtags to href links
        for(var j = 0; j < hashtags.length; j++) {
          var hashtag = hashtags[j].text;
          html = html.replace('#' + hashtag, '<a href="https://www.twitter.com/search?q=%23' + hashtag + '" class="clickable" style="color:#0084B4" target="_blank">' + '#' + hashtag + '</a>');
        }
      }

      // Check if tweet contains links
      if(tweet.links.length > 0) {
        var links = tweet.links;

        // Convert text links into href links
        for (var j = 0; j < links.length; j++) {
          var link = links[j].url;
          html = html.replace(link, '<a href="' + link + '" class="clickable" style="color:#0084B4" target="_blank">' + link + '</a>');
        }
      }

      tweet.text = html;
      return tweet;
    };
  };




