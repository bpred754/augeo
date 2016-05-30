
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
  /* Description: Custom html element to paginate a list of information.     */
  /***************************************************************************/

  augeo.directive('paginate', function() {
    return {
        restrict: 'AE',
        scope: {
          currentPageNumber: '=',
          endPage: '=',
          next: '&',
          previous: '&',
          loadPage: '&'
        },
        templateUrl: 'html/directive/paginate.html',
        link: function(scope, elem, attrs) {

          // Constants
          var ENTRIES_PER_PAGE = 25;
          var MAX_NUMBERS = 5;
          var MAX_INLINE_NUMBERS = 3;
          var LEFT_ARROW_WIDTH = 30;
          var RIGHT_ARROW_WIDTH = 15;
          var PAGE_NUMBER_WIDTH = 30;
          var SMALL_PAGE_WIDTH = 20;
          var LARGE_PAGE_WIDTH = 40;
          var CONTINUE_WIDTH = 30;

          var pageContainerWidth;
          var pageContainer;

          var page1 = {
            value: 1,
            class: 'small-page-number page-button'
          };

          var continuation = {
            value: '...',
            class: 'page-continue'
          };

          // Build paginator after currentPageNumber is set
          scope.$watch("currentPageNumber", function(currentPage) {

            pageContainer = $(elem).children().first();

            var pageLast = {
              value: scope.lastPage,
              class: 'page-number page-button'
            };

            if(currentPage && scope.lastPage) {

              scope.paginatorElements = new Array();
              var pageContainerWidth = Math.ceil(LEFT_ARROW_WIDTH + RIGHT_ARROW_WIDTH);

              // Build Paginator
              // ex: < 1 2 3 (4) 5 >
              if(scope.lastPage <= MAX_NUMBERS) {
                for(var i = 1; i <= scope.lastPage; i++) {
                  scope.paginatorElements.push(getNewPageNumber(i));

                  if(scope.currentPageNumber == i) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' page-selected';
                  }

                  // Add the page number width to the pageContainerWidth
                  pageContainerWidth += PAGE_NUMBER_WIDTH;
                }
              }
              // ex: < 1 ... 4 (5) 6 >
              else if(currentPage > MAX_INLINE_NUMBERS && (scope.lastPage - currentPage < MAX_INLINE_NUMBERS)) {

                scope.paginatorElements.push(page1);
                pageContainerWidth += SMALL_PAGE_WIDTH;

                scope.paginatorElements.push(continuation);
                pageContainerWidth += CONTINUE_WIDTH;

                for(var i = scope.lastPage-(MAX_INLINE_NUMBERS-1); i <= scope.lastPage; i++) {

                  scope.paginatorElements.push({value:i,class:'page-button'});

                  if(i == scope.lastPage && i == scope.currentPageNumber && i > 9) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' big-page-number';
                    pageContainerWidth += LARGE_PAGE_WIDTH;
                  } else {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' page-number';
                    pageContainerWidth += PAGE_NUMBER_WIDTH;
                  }

                  if(scope.currentPageNumber == i) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' page-selected';
                  }
                }
              }
              // ex: < 1 (2) 3 ... 6 >
              else if (currentPage <= MAX_INLINE_NUMBERS && scope.lastPage > MAX_NUMBERS) {
                for(var i = 1; i <= MAX_INLINE_NUMBERS; i++) {

                  scope.paginatorElements.push(getNewPageNumber(i));

                  if(scope.currentPageNumber == i) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' page-selected';
                  }

                  pageContainerWidth += PAGE_NUMBER_WIDTH;
                }

                scope.paginatorElements.push(continuation);
                pageContainerWidth += CONTINUE_WIDTH;

                scope.paginatorElements.push(pageLast);
                pageContainerWidth += PAGE_NUMBER_WIDTH;
              }
              // ex: < 1 ... 4 (5) 6 ... 10 >
              else if (currentPage > MAX_INLINE_NUMBERS && currentPage < (scope.lastPage - (MAX_INLINE_NUMBERS - 1))) {

                scope.paginatorElements.push(page1);
                pageContainerWidth += PAGE_NUMBER_WIDTH;

                scope.paginatorElements.push(continuation);
                pageContainerWidth += CONTINUE_WIDTH;

                var start = currentPage - 1;
                for(var i = start; i < start + MAX_INLINE_NUMBERS; i++) {

                  scope.paginatorElements.push(getNewPageNumber(i));

                  if(scope.currentPageNumber == i) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' page-selected';
                  }

                  if(i == start + MAX_INLINE_NUMBERS - 1 && i < 10) {
                    scope.paginatorElements[scope.paginatorElements.length-1].class += ' small-page-number';
                    pageContainerWidth += SMALL_PAGE_WIDTH;
                  } else {
                    pageContainerWidth += PAGE_NUMBER_WIDTH;
                  }
                }

                scope.paginatorElements.push(continuation);
                pageContainerWidth += CONTINUE_WIDTH;

                scope.paginatorElements.push(pageLast);
                pageContainerWidth += PAGE_NUMBER_WIDTH;
              }

              // Set pageContainer's width
              pageContainer.outerWidth(pageContainerWidth);
            }

          });

          scope.$watch("endPage", function(newVal) {
            if(newVal) {
              scope.lastPage = newVal;
            }
          });

          var getNewPageNumber = function(value) {
            return {
              value:value,
              class:'page-number page-button'
            }
          };
        }
      }
  });
