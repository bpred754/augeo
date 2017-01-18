
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

    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider

      .state('activities', {
        url:'/activities/:username',
        views: {
          'mainContent': {
            templateUrl:'html/activities.html',
            controller: 'ActivitiesController'
          }
        }
      })

      .state('activity', {
        url:'/activity/:activityId',
        views: {
          'mainContent': {
            templateUrl: 'html/activity.html',
            controller: 'ActivityController'
          }
        }
      })

      .state('dashboard', {
        url: '/dashboard',
        views: {
          'mainContent' : {
            templateUrl: 'html/dashboard.html',
            controller:'DashboardController'
          }
        }
      })

      .state('interfaceHistory', {
        url:'/interface-history',
        views: {
          'mainContent': {
            templateUrl:'html/interface-history.html',
            controller: 'InterfaceHistoryController'
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

      .state('sessionUserActivities', {
        url:'/activities',
        views: {
          'mainContent': {
            templateUrl:'html/activities.html',
            controller: 'ActivitiesController'
          }
        }
      })

      .state('viewDashboard', {
        url: '/dashboard/:username',
        views: {
          'mainContent' : {
            templateUrl: 'html/dashboard.html',
            controller:'DashboardController'
          }
        }
      });

    // Remove # from url
    $locationProvider.html5Mode(true);
  };
