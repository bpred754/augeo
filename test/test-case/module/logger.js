
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
  /* Description: Unit test cases for module/logger                          */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var Logger = require('../../../src/module/logger');

  it('should build log string depending on input -- buildLogString()', function(done) {

    var log = new Logger();
    var testParam = 'testParam';

    var logString = log.buildLogString('log-module', 'buildLogString', 'parentProcess', null, {'param':testParam}, 'test message');
    Assert.strictEqual(logString, 'log-module | buildLogString | parentProcess | param:testParam,  | test message');

    done();
  });

  it('should return true for log statement to be written -- doWriteLog()', function() {

    var log = new Logger();

    var doWriteLog = log.doWriteLog('user-service');
    Assert.strictEqual(doWriteLog, true);
  });

  it('should return false for log statement to be written', function() {

    var log = new Logger();
    log.setLogService(false);
    var testSingleton = new Logger();

    var doWriteLog = testSingleton.doWriteLog('user-service');
    Assert.strictEqual(doWriteLog, false);
  });

  it('should extract log type from filename -- extractLogType()', function() {

    var log = new Logger();

    var type = log.extractLogType('logger-module');
    Assert.strictEqual(type, 'module');
  });