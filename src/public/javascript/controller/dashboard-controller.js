
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
  /* Description: Binds data to dashboard.html                               */
  /***************************************************************************/

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($scope, $timeout, $interval, $stateParams, UserClientService, ProfileService) {

    // Internal functions
    var init = function() {

      $scope.invalidUser = false;
      $scope.targetUsername = ($stateParams && $stateParams.username) ? $stateParams.username: null;

      // Get user's profile image and Augeo skill data
      UserClientService.getDashboardDisplayData($scope.targetUsername, function(data) {

        if(data != 'Unauthorized') {

          $scope.isLoaded = true;

          if(data.user) {
            $scope.dashboardData = data.user;
            $scope.mainSkill = data.user.skill;
            $scope.skills = data.user.subSkills;

            var mediumScreenArray = new Array();
            var mediumCount = 0;
            for (var i = 0; i < 3; i++) {
              var innerArray = new Array();
              for (var j = 0; j < 3; j++) {
                innerArray.push($scope.skills[mediumCount]);
                mediumCount++;
              }
              mediumScreenArray.push(innerArray);
            }
            $scope.mediumArray = mediumScreenArray;

            var smallScreenArray = new Array();
            var smallCount = 0;
            for (var i = 0; i < 5; i++) {
              var innerArray = new Array();
              for (var j = 0; j < 2; j++) {
                innerArray.push($scope.skills[smallCount]);
                smallCount++;
              }
              smallScreenArray.push(innerArray);
            }
            $scope.smallArray = smallScreenArray;
          }

          // Set recent activity
          if (data.recentActions && data.recentActions.length > 0) {
            $scope.activities = data.recentActions;
          }

          if (data.errorImageUrl) {
            $scope.invalidUser = true;
            $scope.dashboardData = {
              profileImg: data.errorImageUrl
            };
          }
        }
      });
    };

    $scope.showProfile = function() {

      var targetUser = $scope.dashboardData;
      if($scope.User.username == $scope.dashboardData.username) {
        targetUser = $scope.User;
      }

      ProfileService.setTargetUser(targetUser);

      showProfileModal();
    };

    // If profile image changes, update profile image on dashboard
    $scope.$watch(function() {
        return ProfileService.getProfileImage();
      }, function(newValue, oldValue) {
        if(newValue != oldValue) {
          $scope.dashboardData.profileImg = newValue;
        }
    });

    // Initialize dashboard page
    init();
  };