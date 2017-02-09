
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
  /* Description: Unit test cases for common object commit                   */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Local modules
  var Commit = require('../../../src/public/javascript/common/commit');

  it('should format a commits data into html -- formatText()', function(done) {

    var commitJson = {
      repo: 'test-repo',
      text: 'commit text'
    };

    var commit = new Commit(commitJson);
    Assert.strictEqual(commit.html, 'Commit to <a href="https://github.com/test-repo" target="_blank" onclick="window.event.stopPropagation()">test-repo</a>: commit text');

    done();
  });
