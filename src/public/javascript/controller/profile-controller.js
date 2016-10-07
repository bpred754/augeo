
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
    $scope.profileView = 'Augeo';

    $scope.editProfile = function() {
      $scope.isEditMode = true;
      $scope.profileView = 'Augeo';
    }

    $scope.highlightInterface = function(interface) {
      interface.current = interface.active;
    };

    $scope.removeHighlight = function(interface) {
      if(interface.name != $scope.profileView) {
        interface.current = interface.passive;
      }
    };

    $scope.saveProfileData = function() {
      UserClientService.saveProfileData($scope.targetUser, function(user){

        // Update global User object
        $scope.$parent.User = user;
        UserClientService.setAuthentications($scope.User);
      });
    };

    $scope.setProfileImage = function(interface) {

      for(var i = 0; i < $scope.targetUser.interfaces.length; i++) {
        if(interface.toLowerCase() == $scope.targetUser.interfaces[i].name.toLowerCase()) {
          if($scope.targetUser.interfaces[i].usingProfileImage == false) {
            interface = 'Unselect';
          }
        } else {
          $scope.targetUser.interfaces[i].usingProfileImage = false;
        }
      }

      UserClientService.setProfileImage(interface,  function(user) {

        ProfileService.setProfileImage(user.profileImg);

        // Update profile icon
        if($scope.isGlobalUser) {
          $scope.User.profileIcon = user.profileIcon;
        }
      });
    };

    $scope.setView = function(interface) {

      $scope.profileView = interface.name;

      for(var i = 0; i < $scope.targetUser.interfaces.length; i++) {
        if(interface.name != $scope.targetUser.interfaces[i].name) {
          $scope.targetUser.interfaces[i].current = $scope.targetUser.interfaces[i].passive;
        } else {
          $scope.targetUser.interfaces[i].current = $scope.targetUser.interfaces[i].active;
        }
      }

      if($scope.profileView != 'Augeo') {
        $scope.isEditMode = false;
      } else {
        if($scope.isGlobalUser) {
          $scope.isEditMode = true;
        }
      }
    };

    // If profile image changes, update profile target user and global user profile images
    $scope.$watch(function() {
        return ProfileService.getProfileImage();
      }, function(newValue, oldValue) {

        if(newValue != oldValue) {
          $scope.targetUser.profileImg = newValue.profileImg;
          if($scope.isGlobalUser) {
            $scope.User.profileImg = newValue;
          }
        }
    });

    $scope.$watch(function() {
      return ProfileService.getTargetUser();
    }, function(newValue, oldValue) {

      if(newValue != oldValue) {

        $scope.targetUser = newValue;
        $scope.targetUser.name = newValue.firstName + ' ' + newValue.lastName;
        $scope.targetUser.interfaces = buildUserInterfaces($scope.targetUser);

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

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var buildUserInterfaces = function(targetUser) {

    var interfaces = new Array();

    // AUGEO_INDEX = 0
    interfaces.push({
      name:'Augeo',
      active: 'image/augeo-logo-black-small.png',
      passive: 'image/augeo-logo-gray-small.png',
      current: 'image/augeo-logo-black-small.png',
      hasAuthentication: true
    });

    // TWITTER_INDEX = 1
    interfaces.push({
      name: 'Twitter',
      active: 'image/twitter/logo-blue-small.png',
      passive: 'image/twitter/logo-gray-small.png',
      current: 'image/twitter/logo-gray-small.png',
      hasAuthentication: (targetUser.twitter && targetUser.twitter.screenName),
      usingProfileImage: (targetUser.twitter && targetUser.profileImg == targetUser.twitter.profileImageUrl)
    });

    // GITHUB_INDEX = 2
    interfaces.push({
      name:'Github',
      active: 'image/github/logo-black-small.png',
      passive: 'image/github/logo-gray-small.png',
      current:'image/github/logo-gray-small.png',
      hasAuthentication: (targetUser.github && targetUser.github.screenName),
      usingProfileImage: (targetUser.github && targetUser.profileImg == targetUser.github.profileImageUrl)
    });

    return interfaces;
  };



