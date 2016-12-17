
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
  /* Description: Test cases that verify the data format from Github hasn't  */
  /*              changed                                                    */
  /***************************************************************************/

  // Required libraries
  var Common = require('../../data/common');
  var Https = require('https');
  var Should = require('should');

  // Get user data
  it('should test Githubs api call for user data', function(done) {
    this.timeout(Common.TIMEOUT);

    var options = {
      hostname: 'api.github.com',
      method: 'GET',
      path: '/user',
      headers: {
        'User-Agent': process.env.GITHUB_SCREEN_NAME,
        'Authorization': 'Bearer ' + process.env.GITHUB_ACCESS_TOKEN
      }
    };

    Https.request(options, function(response) {
      requestCallback(response, function(data) {
        var json = JSON.parse(data);
        Should.exist(json.id);
        Should.exist(json.name);
        Should.exist(json.avatar_url);
        Should.exist(json.login);
        done();
      });
    }).end();
  });

  // Get commits
  it('should test Githubs api call for user commits', function(done) {
    this.timeout(Common.TIMEOUT);

    var options = {
      hostname: 'api.github.com',
      method: 'GET',
      path: '/users/' + process.env.GITHUB_SCREEN_NAME + '/events',
      headers: {
        'User-Agent': process.env.GITHUB_SCREEN_NAME,
        'Authorization': 'Bearer ' + process.env.GITHUB_ACCESS_TOKEN
      }
    };

    Https.request(options, function(response) {
      requestCallback(response, function(data, headers) {

        var events = JSON.parse(data);
        for(var i = 0; i < events.length; i++) {

          var event = events[i];
          Should.exist(event.type);
          Should.exist(event.public);
          Should.exist(event.created_at);
          Should.exist(event.id);
          Should.exist(event.repo.name);

          var actor = event.actor;
          Should.exist(actor.avatar_url);
          Should.exist(actor.id);
          Should.exist(actor.display_login);

          var payload = event.payload;
          Should.exist(payload);

          // If a PushEvent has no size, there are no commits to be read.
          // This can happen if a file was added directly through Github,
          // e.g. adding License.md
          if(event.type == 'PushEvent' && payload.size !== 0) {
            var commits = payload.commits;
            commits.length.should.be.above(0);
          }
        }
        done();
      });
    }).end();
  });

  /***************************************************************************/
  /* Private functions                                                       */
  /***************************************************************************/

  var requestCallback = function(response, callback) {
    var data = '';
    response.on('data', function (chunk) {
      data += chunk;
    });

    response.on('end', function () {
      callback(data, response.headers);
    });

    response.on('error', function(error) {
      console.log(error);
    });
  };


