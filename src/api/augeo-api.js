
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
  /* Description: Routes all requests to the appropriate Augeo API           */
  /***************************************************************************/

  // Required local modules
  var Logger = require('../module/logger');

  // Constants
  var API = 'augeo-api';

  // Global variables
  var log = new Logger();

  exports.mapRequests = function(app) {
    log.functionCall(API, 'mapRequests', 'INIT', 'System', {}, 'Initializing Request Mapping');

    // Route middleware that will happen on every request
    app.use(function(req, res, next) {

      // Redirect all non-secure requests as secured requests
      if(req.headers['x-forwarded-proto'] !== 'https' && process.env.ENV == 'prod') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
      }

      // Log each request
      log.trace(req.method + ' ' + req.originalUrl);

      // Continue to the route handler
      next();
    });

    // Route all admin requests to admin-api.js
    app.use('/admin-api', require('./admin-api'));

    // Route all fitbit-api requests to fitbit-api.js
    app.use('/fitbit-api', require('./fitbit-api'));

    // Router all github-api requests to github-api.js
    app.use('/github-api', require('./github-api'));

    // Route all twitter-api requests to twitter-api.js
    app.use('/twitter-api', require('./twitter-api'));

    // Route all user-api requests to user-api.js
    app.use('/user-api', require('./user-api'));

    // For local environment request only, route test-api requests to the test twitter-api.js file
    if(process.env.ENV == 'local') {
      app.use('/test-api', require('../../test/api/twitter-api'));
    }

    // Single Page Application - serve layout.html for all requests
    app.get('*', function(req, res) {
      res.sendfile('./src/public/html/layout.html');
    });
  };
