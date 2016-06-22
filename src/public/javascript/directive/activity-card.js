
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
  /* Description: Javascript for activity-card directive                     */
  /***************************************************************************/

  augeo.directive('activityCard', function() {
    return {
      restrict: 'E',
      scope: {
        'tweetData': '='
      },
      templateUrl: 'html/directive/activity-card.html',
      link: function (scope, element, attributes) {

        scope.$watch(function() {
          return scope.tweetData;
        }, function() {

          if(scope.tweetData) {

            scope.tweetData.formatDate = function (date) {
              scope.tweetData.date = scope.tweetData.date.substring(0, 11);
              return scope.tweetData.date;
            }

            scope.tweetData.formatMedia = function (media) {
              scope.tweetData.media = scope.tweetData.media.substring(0, scope.tweetData.media.length - 6);
              return scope.tweetData.media;
            }

            formatTweet(scope.tweetData);
          }
        });
      }
    }
  });

  /***************************************************************************/
  /* Private Functions                                                       */
  /***************************************************************************/

  var formatTweet = function(tweet) {


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
  };