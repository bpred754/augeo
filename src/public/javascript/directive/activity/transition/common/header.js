
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
  /* Description: Javascript for activity-transition-header directive        */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function() {
    return {
      restrict: 'E',
      scope: {
        'activity': '=',
        'user': '='
      },
      templateUrl: 'html/directive/activity/transition/common/header.html',
      link: function(scope, element, attributes) {

        switch(scope.activity.kind) {
          case 'FITBIT_DAY_STEPS':
            scope.screenName = scope.user.fitbit.fitbitId;
            break;
          case 'GITHUB_COMMIT':
            scope.screenName = scope.user.github.screenName;
            break;
          case 'TWITTER_TWEET':
            scope.screenName = scope.user.twitter.screenName;
            break;
        }
      }
    }
  };
