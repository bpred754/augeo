
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
  /* Description: Binds data to view-activity.html                           */
  /***************************************************************************/

  augeo.controller('ViewActivityController', function($rootScope, $scope, $stateParams, $window, TwitterClientService) {

    // Constants
    var MAX_ID = '9999999999999999999999999999999';

    var maxId = MAX_ID;
    $scope.activityLoaded = false;
    $scope.finishedLoading = false;
    $scope.tweets = new Array();
    $scope.state = 'viewActivity';
    $scope.screenSize = getScreenSize($window.innerWidth);

    // Bind to the window resize function to hide Angular Grid for small screens
    angular.element($window).bind('resize', function(){
      $scope.screenSize = getScreenSize($window.innerWidth);

      // Manual $digest required as resize event is outside of angular
      $scope.$digest();
    });

    TwitterClientService.getActivityDisplayData(function(data) {

      $scope.isLoaded = true;

      if($stateParams.screenName) {
        $scope.screenName = $stateParams.screenName;
      } else {
        $scope.screenName = data.screenName;
      }

      $scope.twitterSkills = data.skills;
      $scope.setSkillActivity('Twitter');
    });

    $scope.getGlyphicon = function(name) {
      var glyphicon = '';
      for(var i = 0; i < $scope.twitterSkills.length; i++) {
        if($scope.twitterSkills[i].name == name) {
          glyphicon = $scope.twitterSkills[i].glyphicon;
          break;
        }
      }
      return glyphicon;
    };

    $scope.getNewPage = function() {

      if($scope.activityLoaded) {
        $scope.activityLoaded = false;
        TwitterClientService.getSkillActivity($scope.screenName, $scope.currentSkill, maxId, function(data) {
          if(data.activity.length > 0) {
            $scope.tweets = $scope.tweets.concat(data.activity);
            maxId =  data.activity[data.activity.length-1].tweetId;
            $scope.activityLoaded = true;
          } else {
            $scope.finishedLoading = true;
          }
        });
      }
    };

    $scope.setSkillActivity = function(skill) {

      maxId = MAX_ID;
      $scope.tweets = new Array();
      $scope.currentSkill = skill;
      $scope.activityLoaded = true;
      $scope.finishedLoading = false;
      $scope.getNewPage();
    };

  });

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
