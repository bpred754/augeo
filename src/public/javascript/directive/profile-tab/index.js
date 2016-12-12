
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
  /* Description: Index file that requires all directives for browserify     */
  /***************************************************************************/

  var augeo = require('angular').module('augeo');

  augeo.directive('augeoProfileTab', require('./augeo-profile-tab'));
  augeo.directive('fitbitProfileTab', ['$state', '$window', 'InterfaceClientService', require('./fitbit-profile-tab')]);
  augeo.directive('githubProfileTab', ['$state', '$window', 'InterfaceClientService', require('./github-profile-tab')]);
  augeo.directive('twitterProfileTab', ['$state', '$timeout', '$window', 'InterfaceClientService', require('./twitter-profile-tab')]);