
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
  /* Description: Singleton that fetches data for Augeo's twitter-api.       */
  /***************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function(AugeoClientService) {

    /***************************************************************************/
    /* Private Functions                                                       */
    /***************************************************************************/

    var formatTime = function(seconds) {
      var minutes = Math.floor(seconds/60);
      var hours = Math.floor(minutes/60);
      var days = Math.floor(hours/24);
      seconds = seconds%60;

      var timeString = '';
      if(days < 1) {
        timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
      } else {
        timeString = days + 'd ' + hours + 'h ' + minutes + 'm';
      }
      return timeString;
    };

    /***************************************************************************/
    /* Service starts                                                          */
    /***************************************************************************/

    this.getAuthenticationData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('twitter-api/getAuthenticationData', parameters, function(data, status) {
        callback(data, status);
      });
    };

    this.getDashboardDisplayData = function(username, callback) {
      var parameters = {username:username};
      AugeoClientService.getAugeoApi('twitter-api/getDashboardDisplayData', parameters, function(data) {
        callback(data);
      });
    };

    this.getSkillActivity = function(username, skill, id, callback) {
      var parameters = {
        username:username,
        skill:skill,
        tweetId: id
      };
      AugeoClientService.getAugeoApi('twitter-api/getSkillActivity', parameters, function(data) {
        callback(data);
      });
    };

    this.getTwitterHistoryPageData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('twitter-api/getTwitterHistoryPageData', parameters, function(data) {

        if(data.tweetWaitTime != -1) {
          data.tweetWaitTime = formatTime(data.tweetWaitTime);
        }

        if(data.mentionWaitTime != -1) {
          data.mentionWaitTime = formatTime(data.mentionWaitTime);
        }

        callback(data);
      });
    };
  };
