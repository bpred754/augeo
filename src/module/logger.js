
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
  /* Description: Object used for logging                                    */
  /***************************************************************************/

  // Required libraries
  var Bunyan = require('bunyan');

  // Required local modules
  var AbstractObject = require('./common/abstract-object');

  // Global variables
  var log = null;
  var logApi = (process.env.LOG_API == 'true');
  var logClassifier = (process.env.LOG_CLASSIFIER == 'true');
  var logCollection = (process.env.LOG_COLLECTION == 'true');
  var logInterface = (process.env.LOG_INTERFACE == 'true');
  var logInterfaceService = (process.env.LOG_INTERFACE_SERVICE == 'true');
  var logModule = (process.env.LOG_MODULE == 'true');
  var logQueue = (process.env.LOG_QUEUE == 'true');
  var logService = (process.env.LOG_SERVICE == 'true');
  var logUtility = (process.env.LOG_UTILITY == 'true');
  var logValidator = (process.env.LOG_VALIDATOR == 'true');

  var $this = function(options) {

    // Logger is a singleton
    if (!log) {
      $this.base.constructor.call(this);
      this.init(options);
    }
  };

  if(!log) {
    AbstractObject.extend(AbstractObject.GenericObject, $this, {

      buildLogString: function (file, functionName, parentProcess, identifier, params, message) {
        var logString = '';

        if (file) {
          logString += file + ' | ';
        }

        if (functionName) {
          logString += functionName + ' | ';
        }

        if (parentProcess) {
          logString += parentProcess + ' | ';
        }

        if (identifier) {
          logString += identifier + ' | ';
        }

        if (params) {
          var paramString = '';
          for (var key in params) {
            if (params.hasOwnProperty(key)) {
              paramString += key + ':' + params[key] + ', ';
            }
          }

          if (paramString.length > 0) {
            logString += paramString + ' | ';
          }
        }

        if (message) {
          logString += message;
        }

        return logString;
      },

      debug: function (e) {
        if (process.env.TEST != 'true') {
          log.debug(e);
        }
      },

      doWriteLog: function (file) {
        var writeLog = false;
        switch (this.extractLogType(file)) {
          case 'api':
            if (logApi) {
              writeLog = true;
            }
            break;
          case 'classifier':
            if (logClassifier) {
              writeLog = true
            }
            break;
          case 'collection':
            if (logCollection) {
              writeLog = true
            }
            break;
          case 'interface':
            if (logInterface) {
              writeLog = true
            }
            break;
          case 'interface_service':
            if (logInterfaceService) {
              writeLog = true
            }
            break;
          case 'module':
            if (logModule) {
              writeLog = true
            }
            break;
          case 'queue':
            if (logQueue) {
              writeLog = true
            }
            break;
          case 'service':
            if (logService) {
              writeLog = true
            }
            break;
          case 'utility':
            if (logUtility) {
              writeLog = true
            }
            break;
          case 'validator':
            if (logValidator) {
              writeLog = true
            }
            break;
          default:
            writeLog = true;
        }
        ;
        return writeLog;
      },

      error: function (e) {
        if (process.env.TEST != 'true') {
          log.error(e);
        }
      },

      extractLogType: function (typeString) {

        var type;
        var dashIndex = typeString.lastIndexOf('-');

        if (dashIndex > 0) {
          type = typeString.substring(dashIndex + 1);
        }
        return type;
      },

      functionCall: function (file, functionName, parentProcess, identifier, params, message) {
        if (process.env.TEST != 'true' && this.doWriteLog(file)) {
          log.info(this.buildLogString(file, functionName, parentProcess, identifier, params, message));
        }
      },

      functionError: function (file, functionName, parentProcess, identifier, message) {
        if (process.env.TEST != 'true') {
          log.warn(this.buildLogString(file, functionName, null, identifier, null, message));
        }
      },

      init: function (options) {
        if (process.env.TEST != 'true') {
          log = new Bunyan({
            name: options.name,
            src: true,
            streams: [
              {
                stream: process.stdout,
                level: options.stdoutLevel
              },
              {
                path: options.logfile,
                level: options.logfileLevel
              }
            ],
            serializers: Bunyan.stdSerializers
          });
        }
      },

      info: function (e) {
        if (process.env.TEST != 'true') {
          log.info(e);
        }
      },

      setLogApi: function(setLogApi) {
        logApi = (setLogApi === 'true');
      },

      setLogClassifier: function(setLogClassifier) {
        logClassifier = (setLogClassifier === 'true');
      },

      setLogCollection: function(setLogCollection) {
        logCollection = (setLogCollection === 'true');
      },

      setLogInterface: function(setLogInterface) {
        logInterface = (setLogInterface === 'true');
      },

      setLogInterfaceService: function(setLogInterfaceService) {
        logInterfaceService = (setLogInterfaceService === 'true');
      },

      setLogModule: function(setLogModule) {
        logModule = (setLogModule === 'true');
      },

      setLogQueue: function(setLogQueue) {
        logQueue = (setLogQueue === 'true');
      },

      setLogService: function (setLogService) {
        logService = (setLogService === 'true');
      },

      setLogUtility: function(setLogUtility) {
        logUtility = (setLogUtility === 'true');
      },

      setLogValidator: function(setLogValidator) {
        logValidator = (setLogValidator === 'true');
      },

      trace: function (e) {
        if (process.env.TEST != 'true') {
          log.trace(e);
        }
      },

      warn: function (e) {
        if (process.env.TEST != 'true') {
          log.warn(e);
        }
      }

    });
  }

  module.exports = $this;