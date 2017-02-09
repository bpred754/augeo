
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

  /****************************************************************************/
  /* Description: Service that contains activity logic                        */
  /****************************************************************************/

  var Commit = require('../common/commit');
  var Flag = require('../common/flag');
  var DaySteps = require('../common/day-steps');
  var Tweet = require('../common/tweet');

  // Reminder: Update service/index.js when service params are modified
  module.exports = function(AugeoClientService) {

    this.getActivity = function(activityId, callback) {
      var self = this;
      AugeoClientService.getAugeoApi('activity-api/getActivity', {activityId:activityId}, function(data) {
        var activityObject = null;
        if(data.activity && data.user) {
          activityObject = self.getActivityObject(data.activity, data.user);
        }
        callback(activityObject);
      });
    };

    this.getActivityObject = function(rawActivity) {

      var activity = rawActivity;
      switch(rawActivity.kind) {
        case 'AUGEO_FLAG':
          activity = new Flag(rawActivity);
          break;
        case 'FITBIT_DAY_STEPS':
          activity = new DaySteps(rawActivity, rawActivity.user.fitbit);
          break;
        case 'GITHUB_COMMIT':
          activity = new Commit(rawActivity);
          break;
        case 'TWITTER_TWEET':
          activity = new Tweet(rawActivity);
          break;
      }

      return activity;
    };

    this.getSkillActivity = function(username, skill, timestamp, callback) {
      var parameters = {
        username:username,
        skill:skill,
        timestamp: timestamp
      };
      AugeoClientService.getAugeoApi('activity-api/getSkillActivity', parameters, function(data) {
        callback(data);
      });
    };
  };