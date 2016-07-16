
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
  /* Description: Controller for profile popup                               */
  /***************************************************************************/

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($scope, ProfileService, UserClientService) {

    $scope.isGlobalUser = false;
    $scope.isEditMode = true;

    $scope.editProfile = function() {
      $scope.isEditMode = true;
    }

    $scope.saveProfileData = function() {
      UserClientService.saveProfileData($scope.targetUser, function(user){

        // Update global User object
        $scope.$parent.User = user;
      });
    };

    $scope.viewAsOther = function() {
      $scope.isEditMode = false;
    }

    $scope.$watch(function() {
      return ProfileService.getTargetUser();
    }, function(newValue, oldValue) {

      if(newValue != oldValue) {

        $scope.targetUser = newValue;
        $scope.targetUser.name = newValue.firstName + ' ' + newValue.lastName;

        if(newValue.twitterScreenName || (newValue.twitter && newValue.twitter.screenName)) {
          $scope.targetUser.hasTwitterAuthentication = true;
        } else {
          $scope.targetUser.hasTwitterAuthentication = false;
        }

        if($scope.targetUser.username != $scope.User.username) {
          $scope.isGlobalUser = false;
          $scope.isEditMode = false;
        } else {
          $scope.isGlobalUser = true;
          $scope.isEditMode = true;
        }
     }
    });
  };

