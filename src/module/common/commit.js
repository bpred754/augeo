
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

    // public variables
    this.avatarImageSrc = json.avatarImageSrc;
    this.eventId = json.eventId;
    this.githubId = json.githubId;
    this.name = json.name;
    this.repo = json.repo;
    this.screenName = json.screenName;
    this.sha = json.sha;
    this.text = json.text;
  };

  AbstractObject.extend(Activity, $this, {});

  module.exports = $this;
