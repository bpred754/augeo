
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
  /* Description: Javascript for twitter-profile-tab directive               */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function($state, $timeout, $window, InterfaceClientService) {
    return {
      restrict: 'E',
      scope: {
        'isGlobalUser': '=',
        'setProfileImage': '=',
        'user': '='
      },
      templateUrl: 'html/directive/profile-tab/twitter-profile-tab.html',
      link: function(scope, element, attributes) {
        scope.interfaceIndex = 1;

        // If the scope user changes, then load the twitter follow button
        scope.$watch(function() {
          return scope.user;
        }, function(newValue, oldValue) {

          if(newValue != oldValue) {

            // Initialize Twitter follow button
            if(scope.user && scope.user.interfaces[scope.interfaceIndex].hasAuthentication) {

              var followButton = element.find('.twitter-follow-button')[0];
              var parent = followButton.parentNode;
              parent.removeChild(followButton);

              var newFollowButton = document.createElement('a');
              $(newFollowButton).addClass('twitter-follow-button');
              $(newFollowButton).attr('href', 'https://twitter.com/' + scope.user.twitter.screenName);
              $(newFollowButton).attr('data-show-count', 'false');
              $(newFollowButton).attr('data-lang', 'en');
              $(newFollowButton).attr('data-show-screen-name', 'false');
              $(parent).append(newFollowButton);

              if(twttr.widgets) {
                twttr.widgets.load();
              }
            }
          }
        });

        scope.submitTwitterAuthentication = function() {

          // Authenticate user with twitter
          InterfaceClientService.getAuthenticationData('twitter-api',function(authData, authStatus) {

            if(authStatus == 200) {
              // Go to Twitter Authentication page
              $window.location.href ='https://twitter.com/oauth/authenticate?oauth_token=' + authData.token;
            } else {
              $state.go('login');
              scope.loginMessage = 'Failed to Authenticate with Twitter'
            }
          });
        };
      }
    }
  };