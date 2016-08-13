
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
  /* Description: Singleton that fetches data for Augeo's twitter-api.       */
  /***************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function(AugeoClientService) {

    /***************************************************************************/
    /* Private Functions                                                       */
    /***************************************************************************/

    var formatTime = function(seconds) {
      var minutes = Math.floor(seconds/60);
      var hours = Math.floor(minutes/60);
      var days = Math.floor(hours/24);
      seconds = seconds%60;

      var timeString = '';
      if(days < 1) {
        timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
      } else {
        timeString = days + 'd ' + hours + 'h ' + minutes + 'm';
      }
      return timeString;
    };

    /***************************************************************************/
    /* Static Variables                                                        */
    /***************************************************************************/

    this.ACTIVITY_KIND = 'TWITTER_TWEET';

    /***************************************************************************/
    /* Service starts                                                          */
    /***************************************************************************/

    this.formatTweet = function(inActivity) {

      var activity = JSON.parse(JSON.stringify(inActivity));
      var tweet = activity.data;

      var html = tweet.text;

      // Check if tweet contains mentions
      if(tweet.mentions.length > 0) {
        var mentions = tweet.mentions;

        // Convert twitter mentions into href links
        for(var j = 0; j < mentions.length; j++) {
          var mention = mentions[j];
          if(mention != tweet.screenName) {
            html = html.replace('@' + mention, '<a href="https://www.twitter.com/' + mention + '" class="clickable" style="color:#0084B4" target="_blank">' + '@' + mention + '</a>');
          }
        }
      }

      // Replace all instances of tweet's screen name with a link
      var screenName = tweet.screenName;
      html = html.replace('@' + screenName, '<a href="https://www.twitter.com/' + screenName + '" class="clickable" style="color:#0084B4" target="_blank">' + '@' + screenName + '</a>');

      // Check if tweet contains hashtags
      if(tweet.hashtags.length > 0) {
        var hashtags = tweet.hashtags;

        // Convert twitter hashtags to href links
        for(var j = 0; j < hashtags.length; j++) {
          var hashtag = hashtags[j];
          html = html.replace('#' + hashtag, '<a href="https://www.twitter.com/search?q=%23' + hashtag + '" class="clickable" style="color:#0084B4" target="_blank">' + '#' + hashtag + '</a>');
        }
      }

      // Check if tweet contains links
      if(tweet.links.length > 0) {
        var links = tweet.links;

        // Convert text links into href links
        for (var j = 0; j < links.length; j++) {
          var link = links[j];
          html = html.replace(link, '<a href="' + link + '" class="clickable" style="color:#0084B4" target="_blank">' + link + '</a>');
        }
      }

      tweet.text = html;
      activity.data = tweet;
      return activity;
    };

    this.getAuthenticationData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('twitter-api/getAuthenticationData', parameters, function(data, status) {
        callback(data, status);
      });
    };

    this.getTwitterHistoryPageData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('twitter-api/getTwitterHistoryPageData', parameters, function(data) {

        if(data.tweetWaitTime != -1) {
          data.tweetWaitTime = formatTime(data.tweetWaitTime);
        }

        if(data.mentionWaitTime != -1) {
          data.mentionWaitTime = formatTime(data.mentionWaitTime);
        }

        callback(data);
      });
    };
  };
