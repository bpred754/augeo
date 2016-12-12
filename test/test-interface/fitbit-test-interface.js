
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
  /* Description: Fitbit Interface mock so requests are not made to Fitbit   */
  /*              during unit text execution                                 */
  /***************************************************************************/

  exports.getAuthData = function(code, logData, callback) {

    if(code != '1') {

      if(code == '2') {
        callback('{"access_token": "2","refresh_token": "2222","user_id": "1000000000"}', {});
      } else {
        // Return request data (auth) and headers
        callback('{"access_token": "1111","refresh_token": "2222","user_id": "1000000000"}', {});
      }
    } else {
      callback();
    }
  };

  exports.getSteps = function(accessToken, period, logData, callback) {

    if(accessToken == '0') {
      callback('{"errors": [{"errorType":"expired_token"}]}');
    } else if(accessToken == '1') {
      callback();
    } else if (accessToken == '2'){
      callback('{"errors": [{"errorType":"invalid access token"}]}');
    } else {
      if(period == '1y') {
        // Return 3 day-steps when period is to 1 year
        callback('{"activities-tracker-steps":[{"dateTime":"Thu Dec 08 2016 17:38:19 GMT-0700 (MST)", "value": 10111}, {"dateTime":"Fri Dec 09 2016 17:38:19 GMT-0700 (MST)", "value": 4321}, {"dateTime":"Sat Dec 10 2016 17:38:19 GMT-0700 (MST)", "value": 1234}]}', {});
      } else {
        // Return 2 day-steps when period is set to less than 1 year
        callback('{"activities-tracker-steps":[{"dateTime":"Thu Dec 08 2016 17:38:19 GMT-0700 (MST)", "value": 10111}, {"dateTime":"Fri Dec 09 2016 17:38:19 GMT-0700 (MST)", "value": 4321}]}', {})
      }
    }
  };

  exports.getUserData = function(accessToken, logData, callback) {

    if(accessToken != '1') {
      // Return request data (user) and headers
      callback('{"user":{"fullName": "Test Tester", "avatar150": "avatar150/location/image.png"}}', {});
    } else {
      callback();
    }
  };

  exports.refreshAccessToken = function(refreshToken, logData, callback) {

    if(refreshToken != '1') {
      // Return request data (refresh) and headers
      callback('{"access_token": "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAzNDM3MzUsInNjb3BlcyI6Indwcm8gd2xvYyB3bnV0IHdzbGUgd3NldCB3aHIgd3dlaSB3YWN0IHdzb2MiLCJzdWIiOiJBQkNERUYiLCJhdWQiOiJJSktMTU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE0MzAzNDAxMzV9.z0VHrIEzjsBnjiNMBey6wtu26yHTnSWz_qlqoEpUlpc","expires_in": 3600,"refresh_token": "c643a63c072f0f05478e9d18b991db80ef6061e4f8e6c822d83fed53e5fafdd7","token_type": "Bearer","user_id": "26FWFL"}', {});
    } else {
      callback();
    }
  };

