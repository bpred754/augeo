
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
  /* Description: Data extracted from Github                                 */
  /***************************************************************************/

  // Required local modules
  var Common = require('./common');

  // Users
  exports.USER_GITHUB = {
    githubId: '1000000000',
    accessToken: '000',
    screenName: 'githubScreenName',
    profileImageUrl: 'githubProfileImage.png'
  };

  var commonEvent = {
    "type": "PushEvent",
    "public": true,
    "repo": {
      "id": 3,
      "name": exports.USER_GITHUB.screenName + "/augeo",
      "url": "https://api.github.com/repos/" + exports.USER_GITHUB.screenName + "/augeo"
    },
    "actor": {
      "id": 1,
      "display_login": exports.USER_GITHUB.screenName,
      "gravatar_id": "",
      "avatar_url": "https://github.com/images/" + exports.USER_GITHUB.profileImageUrl,
      "url": "https://api.github.com/users/" + exports.USER_GITHUB.screenName
    }
  };

  exports.event3 = JSON.parse(JSON.stringify(commonEvent));
  exports.event3.id = 3;
  exports.event3.created_at = "2011-09-06T17:26:27Z";
  exports.event3.payload = {
    "commits": [{
      "author": {"name": Common.USER.firstName},
      "message": "Commit 3.0",
      "sha": "3"
    }]
  };

  exports.event2 = JSON.parse(JSON.stringify(commonEvent));
  exports.event2.id = 2;
  exports.event2.created_at = "2011-09-05T17:26:27Z";
  exports.event2.payload = {
    "commits": [{
      "author": {"name": Common.USER.firstName},
      "message": "Commit 2.0",
      "sha": "2"
    }]
  };

  exports.event1 = JSON.parse(JSON.stringify(commonEvent));
  exports.event1.id = 1;
  exports.event1.created_at = "2011-09-04T17:26:27Z";
  exports.event1.payload = {
    "commits": [{
      "author": {"name": Common.USER.firstName},
      "message": "Commit 1.0",
      "sha": "1"
    }]
  };

  exports.event0 = JSON.parse(JSON.stringify(commonEvent));
  exports.event0.id = 0;
  exports.event0.created_at = "2011-09-03T17:26:27Z";
  exports.event0.payload = {
    "commits": [{
      "author": {"name": Common.USER.firstName},
      "message": "Commit 0.0",
      "sha": "0"
    }]
  };
