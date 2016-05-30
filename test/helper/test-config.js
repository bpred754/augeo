
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
  /* Description: Configures app for unit test execution                     */
  /***************************************************************************/

  process.env.PORT = '8080';
  process.env.AUGEO_HOME = 'http://127.0.0.1:8080';
  process.env.ENV = 'local';
  process.env.TEST = 'true';
  process.env.DB_URL = '';
  process.env.TWITTER_CONSUMER_KEY='';
  process.env.TWITTER_CONSUMER_SECRET='';
  process.env.TWITTER_ACCESS_TOKEN = '';
  process.env.TWITTER_ACCESS_TOKEN_SECRET = '';
  process.env.SCREEN_NAME = '';
  process.env.FULL_NAME = '';

  exports.app  = require('../../src/server');
