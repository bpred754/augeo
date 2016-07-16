
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

  augeo.controller('AppController', ['$scope', '$state', '$window', 'UserClientService', 'ProfileService', 'TwitterClientService', require('./app-controller')]);
  augeo.controller('ActivityController', ['$scope', 'ActivityService', require('./activity-controller')]);
  augeo.controller('DashboardController', ['$scope', '$timeout', '$interval', '$stateParams', 'TwitterClientService', 'ActivityService', 'ProfileService', require('./dashboard-controller')]);
  augeo.controller('LeaderboardController', ['$scope', 'TwitterClientService', require('./leaderboard-controller')]);
  augeo.controller('LoginController', ['$scope', '$state', 'UserClientService', 'TwitterClientService', 'ClientValidator',require('./login-controller')]);
  augeo.controller('LogoutController', ['$scope', '$controller', 'UserClientService', require('./logout-controller')]);
  augeo.controller('ProfileController', ['$scope', 'ProfileService', 'UserClientService', require('./profile-controller')]);
  augeo.controller('TwitterHistoryController', ['$scope', 'TwitterClientService', require('./twitter-history-controller')]);
  augeo.controller('ViewActivityController', ['$rootScope', '$scope', '$stateParams', '$window', 'TwitterClientService', require('./view-activity-controller')]);

  // Error controllers
  require('./error');
