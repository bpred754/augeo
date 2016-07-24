
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
  /* Description: Twitter validating functions                               */
  /***************************************************************************/

  // Required local modules
  var Logger = require('../module/logger');

  // Constants
  var VALIDATOR = 'twitter-validator';

  // Global variables
  var log = new Logger();

  exports.containsUserTwitterData = function(data, logData) {
    log.functionCall(VALIDATOR, 'containsUserTwitterData', logData.parentProcess, logData.username, {'data.id_str':(data)?data.id_str:'invalid'});

    var containsData = false;
    if(data && data.profile_image_url_https && data.id_str && data.name) {
      containsData = true;
    }

    return containsData;
  };

  exports.isScreenNameValid = function(screenName, logData) {
    log.functionCall(VALIDATOR, 'isScreenNameValid', logData.parentProcess, logData.username, {'screenName':screenName});

    var isValid = false;
    if(screenName) {
      var screenNameRegex = new RegExp("^[A-Za-z0-9_]{1,15}$");
      if(screenName.match(screenNameRegex)) {
        isValid = true;
      }
    }

    return isValid;
  };
