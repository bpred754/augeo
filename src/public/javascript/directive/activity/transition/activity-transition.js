
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
  /* Description: Javascript for activity-transition directive               */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function($interval, $timeout) {
    return {
      restrict: 'E',
      scope: {
        'activities': '=',
        'screenName': '='
      },
      templateUrl: 'html/directive/activity/transition/activity-transition.html',
      link: function(scope, element, attributes) {

        var currentIndex = 0;
        var prevIndex = 0;

        // Show the first activity in transition items
        scope.activities[currentIndex].showInTransition = true;

        // Transition logic
        $interval(function () {
          scope.visible = false;

          prevIndex = currentIndex;
          currentIndex++;

          // Reset to first activity
          if (currentIndex == scope.activities.length) {
            currentIndex = 0;
          }

          $timeout(function () {
            scope.activities[prevIndex].showInTransition = false;
            scope.activities[currentIndex].showInTransition = true;
            scope.visible = true;
          }, 1000);
        }, 3500);

        scope.$watch('visible', function(val, oldVal) {
          if(val === oldVal) return; // Skip initial call
          if(val === true) {
            element['fadeIn'](1000);
          } else {
            element['fadeOut'](1000);
          }
        });
      }
    }
  };