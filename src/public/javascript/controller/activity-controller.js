
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
  /* Description: Javascript for activity directives                         */
  /***************************************************************************/

  augeo.controller('ActivityController', function($scope, ActivityService) {

    $scope.$watch(function() {
      return $scope.tweetData;
    }, function() {

      if($scope.tweetData) {

        $scope.tweetData.formatDate = function (date) {
          $scope.tweetData.date = $scope.tweetData.date.substring(0, 11);
          return $scope.tweetData.date;
        }

        $scope.tweetData.formatMedia = function (media) {
          $scope.tweetData.media[0].url = $scope.tweetData.media[0].url.substring(0, $scope.tweetData.media[0].url.length - 6) + ":thumb";
          return $scope.tweetData.media[0].url;
        }

        if($scope.isCard === true && !$scope.tweetData.isTextFormatted) {
          $scope.tweetData.text = ActivityService.formatTweet($scope.tweetData).text;
          $scope.tweetData.isTextFormatted = true;
        }
      }
    });

  });

