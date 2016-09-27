
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
  /* Description: Unit test cases for common object activity                 */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Local modules
  var Activity = require('../../../src/public/javascript/common/activity');

  it('should correctly format a timestamp into a user friendly date -- formatDate()', function(done) {

    var actvityJson = {
      timestamp: new Date("2016-04-12T19:29:41-0700")
    };
    var actvitiy = new Activity(actvityJson);
    Assert.strictEqual(actvitiy.date, '12 Apr 2016');

    done();
  });