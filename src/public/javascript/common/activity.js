
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
  /* Description: Abstract object to store logic and attributes for          */
  /*   activities                                                            */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('./abstract-object');

  // Constructor
  var $this = function(json) {
    $this.base.constructor.call(this, json);

    if(json) {
      // public variables
      this.classification = json.classification;
      this.classificationGlyphicon = json.classificationGlyphicon;
      this.experience = json.experience;
      this.kind = json.kind;
      this.timestamp = json.timestamp;
      this.user = json.user;

      // Client only attributes
      this.date = this.formatDate();
    }
  };

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    formatDate: function () {
      var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      var date = new Date(this.timestamp);
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

  });

  module.exports = $this;
