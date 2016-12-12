
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
  /* Description: Javascript for fitbit-profile-tab directive                */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function($state, $window, InterfaceClientService) {
    return {
      restrict: 'E',
      scope: {
        'isGlobalUser': '=',
        'setProfileImage': '=',
        'user': '='
      },
      templateUrl: 'html/directive/profile-tab/fitbit-profile-tab.html',
      link: function(scope, element, attributes) {
        scope.interfaceIndex = 3;

        scope.submitFitbitAuthentication = function() {

          // Authenticate user with Fitbit
          InterfaceClientService.getAuthenticationData('fitbit-api',function(authData) {

            if(authData.clientId) {
              $window.location.href = encodeURI('https://www.fitbit.com/oauth2/authorize?response_type=' + authData.responseType +
                '&client_id=' + authData.clientId + '&redirect_uri=' + authData.redirectUri + '&scope=' + authData.scope +
                '&state=' + authData.state);
            } else {
              $state.go('login');
              scope.loginMessage = 'Failed to Authenticate with Fitbit'
            }
          });
        };
      }
    }
  };