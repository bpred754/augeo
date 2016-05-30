
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
  /* Description: Singleton that fetches data from Augeo's user-api          */
  /***************************************************************************/

  augeo.service('UserClientService', function(AugeoClientService) {

    this.addUser = function(user, callback) {
      AugeoClientService.postAugeoAPI('user-api/add', user, callback);
    };

    this.removeUser = function(password, callback) {
      var parameters = {password:password}
      AugeoClientService.postAugeoAPI('user-api/remove', parameters, callback)
    }

    this.getCurrentUser = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoAPI('user-api/getCurrentUser', parameters, function(user, status) {
        callback(user, status);
      });
    };

    this.login = function(user, callback) {
      AugeoClientService.postAugeoAPI('user-api/login', user, callback);
    };

    this.logout = function(callback) {
      var parameters = null;
      AugeoClientService.postAugeoAPI('user-api/logout', parameters, callback);
    };

  });
