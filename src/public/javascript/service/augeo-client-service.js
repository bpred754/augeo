
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

  /****************************************************************************/
  /* Description: Singleton that fetches and manipulates data from Augeo API  */
  /****************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function($http, $state) {

    this.getAugeoApi = function(url, parameters, callback) {
      $http({ method: 'GET', url: url, params: parameters}).
      success(function(data, status, headers, config) {
        callback(data, status);
      }).
      error(function(data, status, headers, config) {
        $state.go('login');
        callback(data, status)
      });
    };

    this.postAugeoApi = function(url, parameters, callback) {
      $http({ method: 'POST', url: url, data: parameters}).
      success(function(data, status, headers, config) {
        callback(data, status);
      }).
      error(function(data, status, headers, config) {
        callback(data, status)
      });
    };

  };
