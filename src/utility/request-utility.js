
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
  /* Description: Singleton that makes requests on behalf of Augeo           */
  /***************************************************************************/

  // Required libraries
  var Dns = require('dns');
  var Https = require('https');

  exports.request = function(dnsCheckCount, options, callback, errorCallback) {

    Dns.resolve4(options.hostname, function(error, addresses) {
      if (error) {
        dnsCheckCount++;
        if(dnsCheckCount < 2) {
          exports.request(dnsCheckCount, options, callback, errorCallback);
        } else {
          errorCallback(error);
        }
      } else {
        submitRequest(options, callback, errorCallback);
      }
    });
  };

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var submitRequest = function(options, callback, errorCallback) {
    var request = Https.request(options, function(response) {

      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });

      response.on('end', function () {
        callback(data, response.headers);
      });

      response.on('error', function(error) {
        errorCallback(error);
      });

    });

    request.on('error', function(error) {
      errorCallback(error);
    });

    request.end();
  };