
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
  /* Description: Singleton that fetches data from Augeo's user-api          */
  /***************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function(AugeoClientService) {

    this.addUser = function(user, callback) {
      AugeoClientService.postAugeoApi('user-api/add', user, callback);
    };

    this.flagActivity = function(activityId, classification, suggestedClassification, callback) {
      var parameters = {
        activityId: activityId,
        classification: classification,
        suggestedClassification: suggestedClassification
      };
      AugeoClientService.postAugeoApi('user-api/flagActivity', parameters, callback);
    };

    this.getCompetitors = function(username, skill, callback) {
      var parameters = {
        username: username,
        skill: skill
      };

      AugeoClientService.getAugeoApi('user-api/getCompetitors', parameters, function(data) {
        callback(data);
      });
    };

    this.getCompetitorsWithRank = function(startRank, endRank, skill, callback) {
      var parameters = {
        startRank: startRank,
        endRank: endRank,
        skill: skill
      };

      AugeoClientService.getAugeoApi('user-api/getCompetitors', parameters, function(data) {
        callback(data);
      });
    };

    this.getStateChangedData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('user-api/getStateChangedData', parameters, function(user, status) {
        callback(user, status);
      });
    };

    this.getDashboardDisplayData = function(username, callback) {
      var parameters = {username:username};
      AugeoClientService.getAugeoApi('user-api/getDashboardDisplayData', parameters, function(data) {
        callback(data);
      });
    };

    this.getLeaderboardDisplayData = function(callback) {
      var parameters = null;
      AugeoClientService.getAugeoApi('user-api/getLeaderboardDisplayData', parameters, function(data) {
        callback(data);
      });
    };

    this.login = function(user, callback) {
      AugeoClientService.postAugeoApi('user-api/login', user, callback);
    };

    this.logout = function(callback) {
      var parameters = null;
      AugeoClientService.postAugeoApi('user-api/logout', parameters, callback);
    };

    this.removeUser = function(password, callback) {
      var parameters = {password:password}
      AugeoClientService.postAugeoApi('user-api/remove', parameters, callback)
    };

    this.saveProfileData = function(user, callback) {
      var parameters = {
        username: user.username,
        profession: user.profession,
        location: user.location,
        website: user.website,
        description: user.description
      };
      AugeoClientService.postAugeoApi('user-api/saveProfileData', parameters, callback);
    };

    this.setAuthentications = function(user) {
      // Determine if User has any authentications
      user.hasAuthentications = false;
      if(user.twitter || user.github || user.fitbit) {
        user.hasAuthentications = true;
      }
    };

    this.setProfileImage = function(interface, callback) {
      var parameters = {
        interface: interface
      };
      AugeoClientService.postAugeoApi('user-api/setProfileImage', parameters, callback)
    };

  };
