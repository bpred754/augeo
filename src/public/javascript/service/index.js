
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
  /* Description: Index file that requires all services for browserify       */
  /***************************************************************************/

  var augeo = require('angular').module('augeo');

  augeo.service('ActivityService', require('./activity-service'));
  augeo.service('AugeoClientService', ['$http', '$state', require('./augeo-client-service')]);
  augeo.service('ClientValidator', require('./client-validator'));
  augeo.service('InterfaceClientService', ['AugeoClientService', require('./interface-client-service')]);
  augeo.service('ProfileService', require('./profile-service'));
  augeo.service('UserClientService', ['AugeoClientService', require('./user-client-service')]);
