
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
  var AugeoUtility = require('../utility/augeo-utility');

  exports.containsUserTwitterData = function(data) {
    var containsData = false;

    if(data && data.profile_image_url_https && data.id_str && data.name) {
      containsData = true;
    }

    return containsData;
  };

  exports.isOAuthRequestValid = function(request) {
    var isValid = false;

    if(request) {
      if(request.query) {
        isValid = true;
      }
    }

    return isValid;
  };

  exports.isScreenNameValid = function(screenName) {
    var isValid = false;

    if(screenName) {
      var screenNameRegex = new RegExp("^[A-Za-z0-9_]{1,15}$");
      if(screenName.match(screenNameRegex)) {
        isValid = true;
      }
    }

    return isValid;
  };

  exports.isSessionValid = function(session) {
    var isValid = false;

    if(session) {
      var user = session.user;
      if(user) {
        if(user._id && user.firstName && user.lastName && user.username) {
          isValid = true;
        }
      }
    }
    return isValid;
  };

  exports.isSkillValid = function(skill) {
    var isValid = false;

    if(skill) {
      var subSkills = AugeoUtility.SUB_SKILLS;
      for(var i = 0; i < subSkills.length; i++) {
        if(skill === subSkills[i].name || skill === 'Augeo') {
          isValid = true;
        }
      }
    }

    return isValid;
  };
