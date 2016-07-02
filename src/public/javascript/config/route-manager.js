
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
  /* Description: Routes requests to controllers and views                   */
  /***************************************************************************/

  module.exports = function($stateProvider, $urlRouterProvider, $locationProvider, $analyticsProvider) {

    $urlRouterProvider.otherwise('/profile');

    $stateProvider

        .state('activity', {
            url:'/viewActivity',
            views: {
              'mainContent': {
                templateUrl:'html/view-activity.html',
                controller: 'ViewActivityController'
              }
            }
        })

        .state('leaderboards', {
            url:'/leaderboards',
            views: {
              'mainContent': {
                templateUrl:'html/leaderboard.html',
                controller: 'LeaderboardController'
              }
            }
        })

        .state('login', {
          url:'/login',
          views: {
            'mainContent': {
              templateUrl:'html/login.html',
              controller: 'LoginController'
            }
          }
        })

        .state('logout', {
          url:'/logout',
          views: {
            'mainContent': {
              templateUrl: 'html/login.html',
              controller: 'LogoutController'
            }
          }
        })

        .state('profile', {
          url: '/profile',
          views: {
            'mainContent' : {
              templateUrl: 'html/profile.html',
              controller:'ProfileController'
            }
          }
        })

        .state('signup', {
          url:'/signup',
          views: {
            'mainContent': {
              templateUrl:'html/login.html',
              controller: 'LoginController'
            }
          }
        })

        .state('signupError', {
          url:'/signup/error',
          views: {
            'mainContent': {
              templateUrl:'html/login.html',
              controller: 'SignupErrorController'
            }
          }
        })

        .state('twitterHistory', {
          url:'/twitterHistory',
          views: {
            'mainContent': {
              templateUrl:'html/twitter-history.html',
              controller: 'TwitterHistoryController'
            }
          }
        })

        .state('viewActivity', {
            url:'/viewActivity/:screenName',
            views: {
              'mainContent': {
                templateUrl:'html/view-activity.html',
                controller: 'ViewActivityController'
              }
            }
        })

        .state('viewProfile', {
          url: '/profile/:screenName',
          views: {
            'mainContent' : {
              templateUrl: 'html/profile.html',
              controller:'ProfileController'
            }
          }
        })

    // Remove # from url
    $locationProvider.html5Mode(true);
  };
