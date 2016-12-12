
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
  /* Description: Unit test cases for utility/request-utility                */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var RequestUtility = require('../../../src/utility/request-utility');

  it('should execute error callback given error count of 0 and invalid host', function(done) {

    var options = {
      hostname: 'test',
      method: 'GET',
      path: '/test'
    };

    RequestUtility.request(0, options, function() {}, function() {
      done();
    });
  });

  it('should execute valid callback given a valid host', function(done) {

    var options = {
      hostname: 'www.augeo.io',
      method: 'GET',
      path: '/'
    };

    RequestUtility.request(0, options, function(data, headers) {
      data.length.should.be.above(0);
      Assert.strictEqual(headers["x-powered-by"], "Express");
      done();
    }, function() {});
  });