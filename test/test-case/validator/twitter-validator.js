
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
  /* Description: Unit test cases for validator/twitter-validator            */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var TwitterValidator = require('../../../src/validator/twitter-validator');
  var Common = require('../common');

  // containsTwitterData - negative
  it('should return false for invalid Twitter data - containsTwitterData()', function(done) {

    // Missing profile_image_url_https
    var invalidTwitterData = {
      id_str: 'id_str',
      name: 'test'
    };
    var containsTwitterData = TwitterValidator.containsUserTwitterData(invalidTwitterData, Common.logData);
    Assert.strictEqual(containsTwitterData, false);

    done();
  });

  // containsTwitterData - positive
  it('should return false for invalid Twitter data - containsTwitterData()', function(done) {

    var twitterData = {
      id_str: 'id_str',
      name: 'test',
      profile_image_url_https: 'profile_image'
    };
    var containsTwitterData = TwitterValidator.containsUserTwitterData(twitterData, Common.logData);
    Assert.strictEqual(containsTwitterData, true);

    done();
  });

  // isScreenNameValid - negative
  it('should return false for invalid screen name - isScreenNameValid()', function(done) {

    var invalidScreenName = 'screen name';
    var isScreenNameValid = TwitterValidator.isScreenNameValid(invalidScreenName, Common.logData);
    Assert.strictEqual(isScreenNameValid, false);

    done();
  });

  // isScreenNameValid - positive
  it('should return true for valid screen name - isScreenNameValid()', function(done) {

    var screenName = 'ScreenName';
    var isScreenNameValid = TwitterValidator.isScreenNameValid(screenName, Common.logData);
    Assert.strictEqual(isScreenNameValid, true);

    done();
  });