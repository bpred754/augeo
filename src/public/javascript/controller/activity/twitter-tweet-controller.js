
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
  /* Description: Controller for Twitter Tweet Activity                      */
  /***************************************************************************/

  // Reminder: Update index.js when controller params are modified
  module.exports = function($scope) {

    $scope.activity = formatTweet($scope.activity);
    $scope.tweet = $scope.activity.data;

    $scope.activity.interfaceProfileUrl = 'https://twitter.com/' + $scope.tweet.screenName;

    $scope.tweet.displayScreenName = '@' + $scope.tweet.screenName;

    $scope.activity.link = 'https://twitter.com/statuses/' + $scope.tweet.tweetId;

    $scope.tweet.formatDate = function () {
      var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      var date = new Date($scope.activity.timestamp);
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      $scope.tweet.date = day + ' ' + monthNames[monthIndex] + ' ' + year;
      return $scope.tweet.date;
    }

    if($scope.screenName) {
      if ($scope.tweet.media.url.length > 6) {
        $scope.tweet.media.url = $scope.tweet.media.url.substring(0, $scope.tweet.media.url.length - 6) + ":thumb";
      } else {
        $scope.tweet.media.url = false;
      }
    }
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var formatTweet = function(inActivity) {

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
