
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
  /* Description: Object to manage Twitter connect queue tasks               */
  /***************************************************************************/

  // Required local modules
  var AbstractObject = require('../../../public/javascript/common/abstract-object');
  var Logger = require('../../../module/logger');
  var TwitterInterfaceService = require('../../../interface-service/twitter-interface-service');

  // Global variables
  var log = new Logger();

  // Constants
  var TASK = 'twitter-connect-task';

  // Access with $this.variable inside of class and class.variable outside
  function publicStaticVariables($this)
  {
    var window = 2;
    var requestsPerWindow = process.env.TEST === 'true' ? 120 : 1;

    $this.CONNECT_TIMEOUT = ((window*60)/requestsPerWindow)*1000;
  }

  // Constructor
  var $this = function(users, logData, addCallback, removeCallback, connectCallback) {
    log.functionCall(TASK, 'constructor', logData.parentProcess, logData.username);

    // Call parent constructor
    $this.base.constructor.call(this);

    // public variables
    this.addCallback = addCallback;
    this.connectCallback = connectCallback;
    this.removeCallback = removeCallback;
    this.users = users;
    this.wait = $this.CONNECT_TIMEOUT;
  };

  publicStaticVariables($this);

  AbstractObject.extend(AbstractObject.GenericObject, $this, {

    execute: function(logData, callback) {
      log.functionCall(TASK, 'execute', logData.parentProcess, logData.username);

      TwitterInterfaceService.openStream(this.users, logData, this.addCallback, this.removeCallback, this.connectCallback);
      callback();
    }
  });

  module.exports = $this;