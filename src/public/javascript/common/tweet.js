
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
  /* Description: Object to store Twitter Tweet logic and attributes         */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('./abstract-object');
  var Activity = require('./activity');

  // Constructor
  var $this = function(json) {
    $this.base.constructor.call(this, json);

    if(json) {

      var data;
      if(json.data) {
        data = json.data;
      } else {
        data = json;
      }

      // public variables
      this._id = (data._id) ? data._id.toString() : '';
      this.avatarImageSrc = data.avatarImageSrc;
      this.favoriteCount = data.favoriteCount;
      this.hashtags = data.hashtags;
      this.links = data.links;
      this.media = data.media;
      this.mentions = data.mentions;
      this.name = data.name;
      this.retweetCount = data.retweetCount;
      this.screenName = data.screenName;
      this.text = data.text;
      this.tweetId = data.tweetId;
      this.twitterId = data.twitterId;

      // Client only attributes
      this.displayScreenName = '@' + data.screenName;
      this.html = this.formatText();
      this.interfaceProfileUrl = 'https://twitter.com/' + data.screenName;
      this.link = 'https://twitter.com/statuses/' + data.tweetId;
    }
  };

  AbstractObject.extend(Activity, $this, {

    formatThumbMedia: function() {
      if(this.media.url) {
        this.media.url = this.media.url.substring(0, this.media.url.length - 6) + ":thumb";
      }
    },

    formatText: function() {
      var html = this.text;

      // Check if tweet contains mentions
      if(this.mentions.length > 0) {
        var mentions = this.mentions;

        // Convert twitter mentions into href links
        for(var j = 0; j < mentions.length; j++) {
          var mention = mentions[j];
          if(mention != this.screenName) {
            html = html.replace('@' + mention, '<a href="https://www.twitter.com/' + mention + '" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">' + '@' + mention + '</a>');
          }
        }
      }

      // Replace all instances of tweet's screen name with a link
      var screenName = this.screenName;
      html = html.replace('@' + screenName, '<a href="https://www.twitter.com/' + screenName + '" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">' + '@' + screenName + '</a>');

      // Check if tweet contains hashtags
      if(this.hashtags.length > 0) {
        var hashtags = this.hashtags;

        // Convert twitter hashtags to href links
        for(var j = 0; j < hashtags.length; j++) {
          var hashtag = hashtags[j];
          html = html.replace('#' + hashtag, '<a href="https://www.twitter.com/search?q=%23' + hashtag + '" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">' + '#' + hashtag + '</a>');
        }
      }

      // Check if tweet contains links
      if(this.links.length > 0) {
        var links = this.links;

        // Convert text links into href links
        for (var j = 0; j < links.length; j++) {
          var link = links[j];
          html = html.replace(link, '<a href="' + link + '" class="clickable" style="color:#0084B4" target="_blank" onclick="window.event.stopPropagation()">' + link + '</a>');
        }
      }
      return html;
    }

  });

  module.exports = $this;
