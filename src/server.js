
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

  // Required libraries
  var BodyParser = require('body-parser');
  var CookieParser = require('cookie-parser');
  var Express = require('express');
  var Path = require('path');
  var Session = require('express-session');
  var Compression = require('compression');

  // Logger
  var Logger = require('./module/logger');
  var logOptions = {
    name: 'AugeoLogger',
    stdoutLevel: 'trace',
    logfile: './logs/augeo.log',
    logfileLevel: 'info'
  };
  var log = new Logger(logOptions);

  // Required local modules
  var AugeoApi = require('./api/augeo-api');
  var TwitterRestQueue = require('./queue/twitter-rest-queue');
  var TwitterService = require('./service/twitter-service');
  var TwitterStreamQueue = require('./queue/twitter-stream-queue');

  // Global variables
  var app = Express();
  var port = process.env.PORT || 8080;
  var twitterRestQueue = new TwitterRestQueue();
  var streamQueue = new TwitterStreamQueue();

  /***************************************************************************/
  /* App Configurations                                                      */
  /***************************************************************************/

  // BodyParser allows data to be retrieved for POST requests
  app.use(BodyParser.urlencoded({ extended: true }));
  app.use(BodyParser.json());

  app.use(CookieParser());

  // Configure Express session
  app.use(Session({
    secret: 'secret',
    resave: true, // Forces session to be saved even when unmodified
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store
    })
  );

  app.use(Compression());

  // Configure static files location
  app.use(Express.static(Path.join(__dirname, 'public')));
  app.use(Express.static(Path.join(__dirname, '../node_modules/bootstrap/dist/fonts')));

  // Map requests to a route handler
  AugeoApi.mapRequests(app);

  // Start Server
  app.listen(port);

  // Print environment variables
  log.info('Environment variable - ENV: ' + process.env.ENV);
  log.info('Environment variable - TEST: ' + process.env.TEST);
  log.info('Environment variable - AUGEO_HOME: ' + process.env.AUGEO_HOME);
  log.info('Environment variable - DB_URL: ' + process.env.DB_URL);
  log.info('Environment variable - PORT: ' + process.env.PORT);
  log.info('Running Augeo on port ' + port);

  // Connect to Twitter if not in local environment
  if(process.env.ENV != 'local') {
    TwitterService.connectToTwitter(twitterRestQueue, streamQueue, function(){});
  }

  module.exports = app;
