
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
  /* Description: Object to store Fitbit's daily step count logic and        */
  /*   attributes                                                            */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('./abstract-object');
  var Activity = require('./activity');

  // Constructor
  var $this = function(json, user) {
    $this.base.constructor.call(this, json);

    if(json) {

      var data;
      if (json.data) {
        data = json.data;
      } else {
        data = json;
      }

      // public variables
      this.dateTime = data.dateTime;
      this.fitbitId = user.fitbitId;
      this.name = user.name;
      this.screenName = user.screenName;
      this.steps = data.steps;

      // Client only attributes
      this.avatarImageSrc = user.profileImageUrl;
      this.interfaceLink = 'https://fitbit.com';
      this.interfaceLogo = 'image/fitbit/logo-blue-small.png';
      this.interfaceProfileUrl = 'https://fitbit.com/user/' + this.fitbitId;
      this.html = this.steps + ' steps with Fitbit';
      this.link = this.interfaceProfileUrl;
      this.screenName = this.fitbitId;
    }
  };

  AbstractObject.extend(Activity, $this, {});

  module.exports = $this;
