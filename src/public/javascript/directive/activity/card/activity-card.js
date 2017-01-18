
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
  /* Description: Javascript for activity-card directive                     */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function() {
    return {
      restrict: 'E',
      scope: {
        'activity': '=',
        'isClickable': '=',
        'screenSize': '='
      },
      template: '<ng-include src="getTemplateUrl()"/>',
      link: function(scope, element, attributes) {

        var isInitialized = false;

        scope.getTemplateUrl = function () {
          switch(scope.activity.kind) {
            // Only add cases where activity has custom html
            case 'TWITTER_TWEET':
              return 'html/directive/activity/card/twitter-tweet.html';
              break;
            default:
              return 'html/directive/activity/card/standard-activity.html';
          }
        };

        element.on('mouseenter', function() {
          if(scope.isClickable) {
            if(!isInitialized) {
              angular.element(element[0].querySelector('.ac-component-container')).addClass('clickable');
              isInitialized = true;
            }

            angular.element(element[0].querySelector('.ac-component-container')).addClass('w3-card-4-highlight');
          }
        });

        element.on('mouseleave', function() {
          angular.element(element[0].querySelector('.ac-component-container')).removeClass('w3-card-4-highlight');
        });
      }
    }
  };