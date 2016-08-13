
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
  /* Description: Javascript for Twitter activity directives                 */
  /***************************************************************************/

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($scope, ActivityService) {

    // Check for transition
    $scope.$watch(function() {
      return $scope.tweet;
    }, function() {

      if($scope.activity) {

        $scope.tweet.formatDate = function () {
          var monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct", "Nov", "Dec"
          ];

          var date = new Date($scope.activity.timestamp);
          var day = date.getDate();
          var monthIndex = date.getMonth();
          var year = date.getFullYear();

          $scope.tweet.date = day + ' ' + monthNames[monthIndex] + ' ' + year;
          return $scope.tweet.date;
        };

        $scope.tweet.formatMedia = function () {
          $scope.tweet.media[0].url = $scope.tweet.media[0].url.substring(0, $scope.tweet.media[0].url.length - 6) + ":thumb";
          return $scope.tweet.media[0].url;
        }

        if($scope.isCard === true && !$scope.activity.isTextFormatted) {
          $scope.tweet.text = ActivityService.formatActivity($scope.activity).data.text;
          $scope.activity.isTextFormatted = true;
        }
      }
    });
  };

