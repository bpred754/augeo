
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
  /* Description: Binds data to login.html                                   */
  /***************************************************************************/

  augeo.controller('LoginController', function($scope, $window, $state, UserClientService, TwitterClientService, ClientValidator) {

    // Constants
    var INVALID_LOGIN = 'Invalid email address or password'
    var VALID_CHARACTER_REGEX = new RegExp('^(\\w|[!@#$%^&*(){}\\[\\]|?., ])+');

    $scope.submitLogin = function() {

      var user = {
        'email': $scope.loginEmail,
        'password': $scope.loginPassword,
      };

      // Validate
      if(ClientValidator.isEmailValid(user.email) && ClientValidator.isPasswordValid(user.password)) {

        // Login user
        UserClientService.login(user, function(message, status) {

          if(status == 200) {
            // Go to profile page
            $state.go('profile');
          } else {
            $scope.loginMessage = message; // Set error message
            $scope.$broadcast('removeText'); // Remove text from password input
          }
        });
      } else {
        $scope.loginMessage = INVALID_LOGIN;
        $scope.$broadcast('removeText');
      }
    }; // End submitLogin

    $scope.submitSignup = function() {
      // Add user to augeoDB
      UserClientService.addUser($scope.user, function(addMessage, addStatus) {

        if(addStatus == 200) {

          // Login user
          UserClientService.login($scope.user, function(loginMessage, loginStatus) {

            if(loginStatus = 200) {
              // Authenticate user with twitter
              TwitterClientService.getAuthenticationData(function(authData, authStatus) {

                if(authStatus == 200) {
                  // Go to Twitter Authentication page
                  $window.location.href ='https://twitter.com/oauth/authenticate?oauth_token=' + authData.token;
                } else {
                  $scope.signupMessage = authData.token;
                }
              }); // End authentication
             } else {
             $scope.signupMessage = loginMessage;
            }

          }); // End login
        } else {
          $scope.signupMessage = addMessage;
        }
      }); // End addUser
    };

    $scope.validateAndDisclose = function() {

      var user = {
        'firstName': $scope.signupFirstName,
        'lastName': $scope.signupLastName,
        'email': $scope.signupEmail,
        'password': $scope.signupPassword,
      };

      // Validate
      if(ClientValidator.isStringAlphabetic(user.firstName) && ClientValidator.isStringAlphabetic(user.lastName)) {

        if(ClientValidator.isEmailValid(user.email)) {

          if(ClientValidator.isPasswordValid(user.password)) {

            if($scope.agreedToTerms === true) {
              $('#disclosure-modal').modal();
              $scope.user = user;
            } else {
              $scope.signupMessage = 'Must agree to Terms of Service';
            }
         } else {
           $scope.signupMessage = 'Password requires a capital, lowercase, and number. Must have 6 to 20 characters'
         }
       } else {
         $scope.signupMessage = 'Invalid email address';
       }
     } else {
       $scope.signupMessage = 'Name must contain alphabetic characters only';
     }

   }; // End validateAndDisclose
  }); // End controller
