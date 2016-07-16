
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

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($scope, $state, UserClientService, TwitterClientService, ClientValidator) {

    // Constants
    var INVALID_LOGIN = 'Invalid email address or password'

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
            $state.go('dashboard');
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

      if($scope.signupEmail == $scope.confirmEmail) {

        if($scope.signupPassword == $scope.confirmPassword) {

          // Close confirmation modal
          $('#confirmation-modal').modal('toggle');

          // Add user to augeoDB
          UserClientService.addUser($scope.user, function(addMessage, addStatus) {

            if(addStatus == 200) {

              // Login user
              UserClientService.login($scope.user, function(loginMessage, loginStatus) {

                if(loginStatus == 200) {
                  $state.go('dashboard');
                } else {
                  $scope.signupMessage = loginMessage;
                }

              }); // End login
            } else {
              $scope.signupMessage = addMessage;
            }
          }); // End addUser

        } else {
          $scope.confirmationError = 'Passwords do not match. Please try again.';
        }
      } else {
        $scope.confirmationError = 'Emails do not match. Please try again.';
      }
    };

    $scope.validateAndConfirm = function() {

      var user = {
        'firstName': $scope.signupFirstName,
        'lastName': $scope.signupLastName,
        'email': $scope.signupEmail,
        'username': $scope.signupUsername,
        'password': $scope.signupPassword,
      };

      // Validate
      if(ClientValidator.isStringAlphabetic(user.firstName) && ClientValidator.isStringAlphabetic(user.lastName)) {

        if(ClientValidator.isEmailValid(user.email)) {
          
          if(ClientValidator.isUsernameValid(user.username)) {

            if (ClientValidator.isPasswordValid(user.password)) {

              if ($scope.agreedToTerms === true) {
                $('#confirmation-modal').modal();
                $scope.user = user;
              } else {
                $scope.signupMessage = 'Must agree to Terms of Service';
              }
            } else {
              $scope.signupMessage = 'Password requires a capital, lowercase, and number. Must have 6 to 20 characters'
            }
          } else {
            $scope.signupMessage = 'Username must be 1 to 15 characters - underscores included'
          }
       } else {
         $scope.signupMessage = 'Invalid email address';
       }
     } else {
       $scope.signupMessage = 'Name must contain alphabetic characters only';
     }

   }; // End validateAndDisclose
  }; // End controller
