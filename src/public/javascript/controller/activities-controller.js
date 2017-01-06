
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
  /* Description: Binds data to activities.html                              */
  /***************************************************************************/

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($rootScope, $scope, $stateParams, $window, UserClientService, ActivityService) {

    /***************************************************************************/
    /* Private functions                                                       */
    /***************************************************************************/

    var getScreenSize = function(width) {
      var screenSize;
      if(width > 764) {
        screenSize = 'large';
      } else if(width > 500) {
        screenSize = 'small';
      } else {
        screenSize = 'x-small';
      }
      return screenSize;
    };

    /***************************************************************************/
    /* Controller start                                                        */
    /***************************************************************************/

    // Constants
    var MAX_TIMESTAMP = new Date(8640000000000000);

    var maxTimestamp = MAX_TIMESTAMP;
    $scope.activityLoaded = false;
    $scope.finishedLoading = false;
    $scope.activities = new Array();
    $scope.state = 'activities';
    $scope.screenSize = getScreenSize($window.innerWidth);

    // Bind to the window resize function to hide Angular Grid for small screens
    angular.element($window).bind('resize', function(){
      $scope.screenSize = getScreenSize($window.innerWidth);

      // Manual $digest required as resize event is outside of angular
      $scope.$digest();
    });

    UserClientService.getActivityDisplayData(function(data) {

      if(data != 'Unauthorized') {

        $scope.isLoaded = true;

        if ($stateParams.username) {
          $scope.username = $stateParams.username;
        } else {
          $scope.username = $scope.User.username;
        }

        $scope.skills = data.skills;
        $scope.setSkillActivity('Augeo');
      }
    });

    $scope.flagActivity = function(activity, suggestedClassification) {

      // Set the current activity's suggestedClassification
      activity.suggestedClassification = suggestedClassification;

      UserClientService.flagActivity(activity.id, activity.classification, suggestedClassification, function(data, status) {
        if(status == 200) {
          closeFlagActivityModal();
        } else {
          $scope.flagActivityError = data;
        }
      });
    };

    $scope.getGlyphicon = function(name) {
      var glyphicon = 'glyphicon-books';

      if ($scope.skills) { // Make sure ActivitiesController data has loaded
        if (name == 'Delete Activity') {
          glyphicon = 'glyphicon-trash'
        } else {
          for (var i = 0; i < $scope.skills.length; i++) {
            if ($scope.skills[i].name == name) {
              glyphicon = $scope.skills[i].glyphicon;
              break;
            }
          }
        }
      }
      return glyphicon;
    };

    $scope.getNewPage = function() {

      if($scope.activityLoaded) {
        $scope.activityLoaded = false;
        UserClientService.getSkillActivity($scope.username, $scope.currentSkill, maxTimestamp, function(data) {

          var activity = data.activity;
          if(activity) {
            if (activity.length > 0) {
              for(var i = 0; i < activity.length; i++) {
                $scope.activities.push(ActivityService.getActivityObject(activity[i], data.user));
              }
              maxTimestamp = data.activity[data.activity.length - 1].timestamp;
              $scope.activityLoaded = true;
            } else {
              $scope.finishedLoading = true;
            }
          } else {
            $scope.invalidUser = true;
          }
        });
      }
    };

    $scope.setSkillActivity = function(skill) {

      maxTimestamp = MAX_TIMESTAMP;
      $scope.activities = new Array();
      $scope.currentSkill = skill;
      $scope.activityLoaded = true;
      $scope.finishedLoading = false;
      $scope.getNewPage();
    };
  };
