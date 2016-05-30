
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
  /* Description: Binds data to profile.html                                 */
  /***************************************************************************/

  augeo.controller('ProfileController', function($scope, $stateParams, TwitterClientService) {

    // Internal functions
    var init = function() {

      $scope.initMessage = 'Welcome to Augeo!';
      $scope.invalidProfile = false;

      $scope.screenName = $stateParams.screenName;
      if($scope.screenName) {
        $scope.state = 'viewProfile';
      } else {
        $scope.state = 'profile';
      }

      // Get user's Twitter profile image url, Twitter skill data, and Twitter sub skill data
      TwitterClientService.getProfileDisplayData($scope.screenName, function(data) {

        $scope.isLoaded = true;

        if(data.profileData) {
          $scope.profileImageUrl= data.profileData.profileImageUrl;
          $scope.skills = data.profileData.subSkills;

          var mediumScreenArray = new Array();
          var mediumCount = 0;
          for(var i = 0; i < 3; i++) {
            var innerArray = new Array();
            for(var j = 0; j < 3; j++) {
              innerArray.push($scope.skills[mediumCount]);
              mediumCount++;
            }
            mediumScreenArray.push(innerArray);
          }
          $scope.mediumArray = mediumScreenArray;

          var smallScreenArray = new Array();
          var smallCount = 0;
          for(var i = 0; i < 5; i++) {
            var innerArray = new Array();
            for(var j = 0; j < 2; j++) {
              innerArray.push($scope.skills[smallCount]);
              smallCount++;
            }
            smallScreenArray.push(innerArray);
          }
          $scope.smallArray = smallScreenArray;

          // Call directive to create main circlular progress bar
          $scope.$broadcast('createCircularProgressBar', data.profileData);
        }

        if(data.recentActions) {
          $scope.tweetData = data.recentActions;
        }

        if(data.errorImageUrl) {
          $scope.invalidProfile = true;
          $scope.profileImageUrl = data.errorImageUrl
        }
      });
    };

    // Initialize Profile page
    init();
  });
