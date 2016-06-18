
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
  /* Description: Custom html element to display twitter activity            */
  /***************************************************************************/

  // Constants
  var ACTIVITY_FOOTER_WIDTH = 180;
  var ACTION_COUNT_WIDTH = 14;
  var FADE_TIME= 1000;
  var DELAY_TIME = 2000;

  // Activity variables
  var activityArray = new Array();
  var index = 0;

  // DOM Elements
  var activityElement;
  var avatarImageLink;
  var avatarImageElement;
  var nameContainer;
  var nameElement;
  var screenNameElement;
  var experienceContainerElement;
  var classificationElement;
  var textElement;
  var mediaElement;
  var mediaLink;
  var activityFooter;
  var timestamp;
  var replyIntent;
  var retweetIntent;
  var retweetCountElement;
  var favoriteIntent;
  var favoriteCountElement;

  augeo.directive('activity', function($state) {
    return {
      restrict: 'AE',
      scope: {
        tweetData:'=',
        initMessage:'=',
        state:'='
      },
      templateUrl: 'html/directive/activity.html',
      link: function(scope, element, attributes) {

        // DOM Elements
        activityElement = $(element);
        activityContainer = activityElement.find('.activity-container');
        avatarImageLink = activityElement.find('.avatar-image-link');
        avatarImageElement = activityElement.find('.avatar-image');
        nameContainer = activityElement.find('.name-container');
        nameElement = activityElement.find('.name');
        screenNameElement = activityElement.find('.screen-name');
        experienceContainerElement = activityElement.find('.experience-container');
        classificationElement = activityElement.find('.classification');
        textElement = $(activityElement).find('#tweet-text');
        mediaElement = activityElement.find('.tweet-media');
        mediaLink = activityElement.find('.media-link');
        activityFooter = activityElement.find(".tweet-footer");
        timestamp = activityElement.find('.timestamp');
        replyIntent = activityElement.find('.reply');
        retweetIntent = activityElement.find('.retweet');
        retweetCountElement = activityElement.find('.retweet-count');
        favoriteIntent = activityElement.find('.favorite');
        favoriteCountElement = activityElement.find('.favorite-count');

        // Twitter intent listeners
        replyIntent.mouseenter(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/reply-hover.png')
        }).mouseleave(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/default-reply.png');
        });
        retweetIntent.mouseenter(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/retweet-hover.png')
        }).mouseleave(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/default-retweet.png');
        });
        favoriteIntent.mouseenter(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/favorite-hover.png')
        }).mouseleave(function() {
          $(this).children('.tweet-action').attr('src','image/twitter/default-favorite.png');
        });

        var hasImageLoaded = false;

        var setActivityData = function(element, tweetData, transition) {

          if($state.current.name === scope.state) {

            var name = tweetData.name;
            var tweetScreenName = tweetData.screenName;
            var avatarImageSrc = tweetData.avatarImageSrc;
            var experience = tweetData.experience;
            var classificationGlyphicon = tweetData.classificationGlyphicon;
            var retweetCount = tweetData.retweetCount;
            var favoriteCount = tweetData.favoriteCount;
            var text = tweetData.text;
            var media = tweetData.media;
            var date = tweetData.date;
            var statusId = tweetData.tweetId;
            var avatarLink = 'https://twitter.com/' + tweetScreenName;

            // Reset activityFooterWidth
            var activityFooterWidth = ACTIVITY_FOOTER_WIDTH;

            // Only show retweet/favorite count elements if the counts are greater than 0
            if(retweetCount > 0) {
              retweetCountElement.show();
              activityFooterWidth += ACTION_COUNT_WIDTH;
            } else {
              retweetCountElement.hide();
            }

            if(favoriteCount > 0) {
              favoriteCountElement.show();
              activityFooterWidth += ACTION_COUNT_WIDTH;
              favoriteIntent.parent().css('padding-right','4px');
            } else {
              favoriteCountElement.hide();
              favoriteIntent.parent().css('padding-right','0px');
            }

            // Set avatar image
            avatarImageLink.attr('href', avatarLink);
            avatarImageElement.attr('src', avatarImageSrc);

            // Set Name
            nameElement.attr('href', avatarLink);
            nameElement.text(name);

            // Set screen name
            screenNameElement.attr('href', avatarLink);
            screenNameElement.text('@'+ tweetScreenName);

            // Set experience
            experienceContainerElement.find('.experience').text('+'+experience);

            // Set classification glyphicon
            classificationElement.attr('class','glyphicon ' + classificationGlyphicon);

            // Set text
            textElement.empty();
            textElement.append(text);

            // Set Media
            if(media) {
              mediaElement.css('display', 'initial');
              mediaElement.attr('src', media);
              mediaLink.attr('href', 'https://www.twitter.com/statuses/'+ statusId);
            } else {
              mediaElement.css('display', 'none')
            }

            // Set date
            timestamp.attr('href', 'https://www.twitter.com/statuses/'+ statusId);
            timestamp.text(date);

            // Set reply, retweet, and favorite intents
            replyIntent.attr('href','https://twitter.com/intent/tweet?in_reply_to=' + statusId);
            retweetIntent.attr('href','https://twitter.com/intent/retweet?tweet_id=' + statusId);
            retweetCountElement.text(retweetCount);
            favoriteIntent.attr('href','https://twitter.com/intent/favorite?tweet_id=' + statusId);
            favoriteCountElement.text(favoriteCount);

            // Set activityFooter width
            activityFooter.width(activityFooterWidth);

            if(transition) {
              activityContainer.css('visibility','initial');

              // Vertically center activityElement
              var jumbotron = activityElement.parent().parent().parent();
              var jumbotronHeight = jumbotron.outerHeight();
              var activityElementHeight = activityElement.height();

              // Add height to activity element since image is not accounted for during the first transition
              if(!hasImageLoaded && media) {
                activityElementHeight += 150
                hasImageLoaded = true;
              }

              // Add height for initial message
              if(activityElementHeight < 0) {
                activityElementHeight = 150;
              }

              var textElementPadding = parseInt(Math.abs(textElement.css('margin-bottom').replace('px','')));
              var experiencePadding = parseInt(experienceContainerElement.find('.experience').css('bottom').replace('px',''));
              var activityElementPadding = textElementPadding + experiencePadding;
              var difference = (jumbotronHeight - (activityElementHeight + activityElementPadding));
              var centerPadding = difference/2;
              var defaultJumbotronPadding = jumbotron.css('padding-top').replace('px', '');

              if(media) {
                defaultJumbotronPadding -= 20;
                textElement.children('p').css('font-size', '.8em');
              }

              centerPadding -= defaultJumbotronPadding;
              activityElement.css('margin-top', centerPadding + 'px');

              // Increment through recent activity
              if (index < activityArray.length) {
                if(index == activityArray.length -1) {
                  index = 0;
                } else {
                  index++;
                }

                // Fade text in and out
                activityElement.fadeIn(FADE_TIME)
                                     .delay(DELAY_TIME)
                                     .fadeOut(FADE_TIME, function(){setActivityData(element, activityArray[index], true)});
              }
            }
          }
        };

        if(scope.tweetData.constructor === Array) {
          for(var i = 0; i < scope.tweetData.length; i++) {
            activityArray.push(formatActivity(scope.tweetData[i]));
          }

          avatarImageElement.hide();
          nameElement.hide();
          screenNameElement.hide();
          experienceContainerElement.hide();
          replyIntent.hide();
          retweetIntent.hide();
          retweetCountElement.hide();
          favoriteIntent.hide();
          favoriteCountElement.hide();

          textElement.text(scope.initMessage);

          activityElement.fadeIn(FADE_TIME)
                               .delay(DELAY_TIME)
                               .fadeOut(FADE_TIME, function() {

                                 // Show hidden elements
                                 avatarImageElement.show();
                                 nameElement.show();
                                 screenNameElement.show();
                                 experienceContainerElement.show();
                                 replyIntent.show();
                                 retweetIntent.show();
                                 favoriteIntent.show();

                                 setActivityData(element, activityArray[0], true)
                                });

        } else {
          scope.tweetData = formatActivity(scope.tweetData);
          setActivityData(element, scope.tweetData, false);
        }
      }
    }
  });

  var formatActivity = function(tweetData) {

    // Get status date
    var date = tweetData.date;
    var dateParts = date.split(' ');
    tweetData.date = dateParts[1] + ' ' + dateParts[2] + ' ' + dateParts[5];

    // Get status text
    var text = '<p>' + tweetData.text + '</p>';

    // Check if tweet contains mentions
    if(tweetData.mentions.length > 0) {
      var mentions = tweetData.mentions;

      // Convert twitter mentions into href links
      for(var j = 0; j < mentions.length; j++) {
        var mention = mentions[j].screen_name;
        text = text.replace('@' + mention, '<a href="https://www.twitter.com/' + mention + '" style="color:#0084B4">' + '@' + mention + '</a>');
      }
    }

    // Check if tweet contains hashtags
    if(tweetData.hashtags.length > 0) {
      var hashtags = tweetData.hashtags;

      // Convert twitter hashtags to href links
      for(var j = 0; j < hashtags.length; j++) {
        var hashtag = hashtags[j].text;
        text = text.replace('#' + hashtag, '<a href="https://www.twitter.com" style="color:#0084B4">' + '#' + hashtag + '</a>');
      }
    }

    // Check if tweet contains links
    if(tweetData.links.length > 0) {
      var links = tweetData.links;

      // Convert text links into href links
      for(var j = 0; j < links.length; j++) {
        var link = links[j].url;
        text = text.replace(link, '<a href="'+ link + '" style="color:#0084B4">' + link + '</a>');
      }
    }

    tweetData.text = text;

    return tweetData;
  }
