
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
  /* Description: GithubInterface mock so requests are not made to Github    */
  /*              during unit text execution                                 */
  /***************************************************************************/

  // Required local modules
  var Common = require('../data/common');
  var GithubData = require('../data/github-data');

  exports.getAccessToken = function(code, logData, callback) {

    if(code == 'failAccessToken') {
      callback();
    } else if (code == 'failUserData') {
      callback('{"access_token":"failUserData"}');
    } else {
      callback('{"access_token":"11111"}');
    }
  };

  exports.getUserData = function(accessToken, logData, callback) {
    if(accessToken != 'failUserData') {
      callback('{"id": "' + GithubData.USER_GITHUB.githubId + '", "name": "' + Common.USER.firstName + '", "avatarUrl":"' + GithubData.USER_GITHUB.profileImageUrl + '", "login": "' + GithubData.USER_GITHUB.screenName + '"}');
    } else {
      callback();
    }
  };


