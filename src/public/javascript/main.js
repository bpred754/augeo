
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
  /* Description: File used by browserify to bundle javascript               */
  /***************************************************************************/

  window.jQuery = $ = require('jquery');

  // Require node_module libraries
  require('angular');
  require('angulartics');
  require('angular-ui-router');
  require('bootstrap/dist/js/bootstrap');

  // Require local libraries
  require('./lib/angular-grid');
  require('./lib/angular-progress-arc')();
  require('./lib/google-analytics')();

  // Initialize angular module
  angular.module('augeo', ['ui.router', 'angulartics', require('angulartics-google-analytics'), 'angularGrid', 'angular-progress-arc']);

  // Grab angular components from public directories that contain an index.js
  require('./common');
  require('./config');
  require('./controller');
  require('./directive');
  require('./service');
  require('./filter');

  // Require libraries after page is ready
  $(document).ready(function() {
    require('./lib/twitter')();
  });