
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
  /* Description: Index file that requires all controllers for browserify    */
  /***************************************************************************/

  var augeo = require('angular').module('augeo');

  augeo.controller('AppController', ['$scope', '$state', 'UserClientService', 'ProfileService', require('./app-controller')]);
  augeo.controller('DashboardController', ['$scope', '$timeout', '$interval', '$stateParams', 'UserClientService', 'ProfileService', 'ActivityService',require('./dashboard-controller')]);
  augeo.controller('InterfaceHistoryController', ['$scope', 'InterfaceClientService', require('./interface-history-controller')]);
  augeo.controller('LeaderboardController', ['$scope', 'UserClientService', require('./leaderboard-controller')]);
  augeo.controller('LoginController', ['$scope', '$state', 'UserClientService', 'ClientValidator',require('./login-controller')]);
  augeo.controller('LogoutController', ['$scope', '$controller', 'UserClientService', require('./logout-controller')]);
  augeo.controller('ProfileController', ['$scope','ProfileService', 'UserClientService', require('./profile-controller')]);
  augeo.controller('ActivitiesController', ['$rootScope', '$scope', '$stateParams', '$window', 'UserClientService', 'ActivityService', require('./activities-controller')]);

  require('./error');
