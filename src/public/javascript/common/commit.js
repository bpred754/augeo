
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
  /* Description: Object to store Github Commit logic and attributes         */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('./abstract-object');
  var Activity = require('./activity');

  // Constructor
  var $this = function(json) {
    $this.base.constructor.call(this, json);

    if(json) {

      var data;
      if (json.data) {
        data = json.data;
      } else {
        data = json;
      }

      // public variables
      this.avatarImageSrc = data.avatarImageSrc;
      this.eventId = data.eventId;
      this.githubId = data.githubId;
      this.name = data.name;
      this.repo = data.repo;
      this.screenName = data.screenName;
      this.sha = data.sha;
      this.text = data.text;

      // Client only attributes
      this.displayScreenName = this.screenName;
      this.html = this.formatText();
      this.interfaceLink = 'https://github.com';
      this.interfaceLogo = 'image/github/logo-black-small.png';
      this.interfaceProfileUrl = 'https://github.com/' + this.screenName;
      this.link = 'https://github.com/' + this.repo  + '/commit/' + this.sha;
    }
  };

  AbstractObject.extend(Activity, $this, {

    formatText: function() {
      var html = 'Commit to <a href="https://github.com/' + this.repo + '" target="_blank" onclick="window.event.stopPropagation()">' +  this.repo + '</a>: ';
      return html += this.text;
    }

  });

  module.exports = $this;
