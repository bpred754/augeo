
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
  /* Description: Object to store Augeo's flag logic and attributes          */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('./abstract-object');
  var Activity = require('./activity');

  // Constructor
  var $this = function(json) {
    $this.base.constructor.call(this, json);

    if(json) {

      var data = json.data;
      var user = json.user;

      // public variables
      this.flaggedActivityId = data.activity;
      this.flaggee = data.flaggee;
      this.newClassification = data.newClassification;
      this.previousClassification = data.previousClassification;
      this.reclassifiedDate = data.reclassifiedDate;

      // Client only attributes
      this.avatarImageSrc = user.profileImg;
      this.displayScreenName = user.username;
      this.interfaceLink = 'https://www.augeo.io';
      this.interfaceLogo = 'image/augeo-logo-small.png';
      this.interfaceProfileUrl = 'https://www.augeo.io/dashboard/' + user.username;
      this.html = 'Correctly flagged <a href="https://www.augeo.io/dashboard/'+this.flaggee+'" target="_blank" onclick="window.event.stopPropagation()">'+this.flaggee+'\'s</a> <a class="clickable">activity</a> with an original classification of ' + this.previousClassification + ' as ' + this.newClassification;
      this.link = this.interfaceLink;
      this.name = user.firstName + ' ' + user.lastName;
      this.screenName = user.username;
    }
  };

  AbstractObject.extend(Activity, $this, {});

  module.exports = $this;
