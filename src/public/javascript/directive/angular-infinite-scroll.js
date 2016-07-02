
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
  /* Description: Directive for infinite scrolling                           */
  /*   - Source:  https://github.com/sroze/ngInfiniteScroll                  */
  /***************************************************************************/

  // Reminder: Update directive/index.js when directive params are modified
  module.exports = function($rootScope, $window, $timeout) {
      return {
        link: function(scope, elem, attrs) {
          var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
          $window = angular.element($window);
          scrollDistance = 0;
          if (attrs.infiniteScrollDistance != null) {
            scope.$watch(attrs.infiniteScrollDistance, function(value) {
              return scrollDistance = parseInt(value, 10);
            });
          }
          scrollEnabled = true;
          checkWhenEnabled = false;
          if (attrs.infiniteScrollDisabled != null) {
            scope.$watch(attrs.infiniteScrollDisabled, function(value) {
              scrollEnabled = !value;
              if (scrollEnabled && checkWhenEnabled) {
                checkWhenEnabled = false;
                return handler();
              }
            });
          }
          handler = function() {
            var elementBottom, remaining, shouldScroll, windowBottom;
            windowBottom = $window.height() + $window.scrollTop();
            elementBottom = elem.offset().top + elem.height();
            remaining = elementBottom - windowBottom;
            shouldScroll = remaining <= $window.height() * scrollDistance;
            if (shouldScroll && scrollEnabled) {
              if ($rootScope.$$phase) {
                return scope.$eval(attrs.infiniteScroll);
              } else {
                return scope.$apply(attrs.infiniteScroll);
              }
            } else if (shouldScroll) {
              return checkWhenEnabled = true;
            }
          };
          $window.on('scroll', handler);
          scope.$on('$destroy', function() {
            return $window.off('scroll', handler);
          });
          return $timeout((function() {
            if (attrs.infiniteScrollImmediateCheck) {
              if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                return handler();
              }
            } else {
              return handler();
            }
          }), 0);
        }
      };
    };
