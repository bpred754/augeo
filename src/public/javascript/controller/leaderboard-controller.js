
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
  /* Description: Binds data to leaderboard.html                             */
  /***************************************************************************/

  augeo.controller('LeaderboardController', function($scope, TwitterClientService) {

    // Constants
    var USERS_PER_PAGE = 25;

    var init = function() {

      $scope.currentTwitterSkill = 'Twitter';

      TwitterClientService.getLeaderboardDisplayData (function(data) {

        $scope.searchName = data.screenName;
        $scope.twitterSkills = data.skills;
        $scope.lastPage = Math.ceil(data.numberUsers/USERS_PER_PAGE);

        TwitterClientService.getCompetitors(data.screenName, $scope.currentTwitterSkill, function(inUsers) {
          $scope.isLoaded = true;
          $scope.currentPage = Math.ceil(inUsers[0].rank/USERS_PER_PAGE);
          $scope.users = inUsers;
        });

      });
    };

    $scope.getCompetitorsWithScreenName = function() {
      TwitterClientService.getCompetitors($scope.searchName, $scope.currentTwitterSkill, function(inUsers) {
        setUsers(inUsers);

        // Get rank of first user in page
        var firstRank = inUsers[0].rank;

        // Set page number
        var pageNumber = Math.ceil(firstRank/USERS_PER_PAGE);
        $scope.currentPage = pageNumber;
      });
    };

    $scope.getGlyphicon = function(name) {
      var glyphicon = '';
      for(var i = 0; i < $scope.twitterSkills.length; i++) {
        if($scope.twitterSkills[i].name == name) {
          glyphicon = $scope.twitterSkills[i].glyphicon;
          break;
        }
      }
      return glyphicon;
    };

    $scope.getSkillLeaders = function(skill) {

      $scope.currentTwitterSkill = skill;

      TwitterClientService.getCompetitors($scope.searchName, skill, function(inUsers) {
        setUsers(inUsers);

        // Get rank of first user in page
        var firstRank = inUsers[0].rank;

        // Set page number
        var pageNumber = Math.ceil(firstRank/USERS_PER_PAGE);
        $scope.currentPage = pageNumber;
      });
    };

    $scope.loadNext = function() {

      if($scope.currentPage < $scope.lastPage) {
        $scope.currentPage++;

        var index = $scope.users.length-1;
        var startRank = $scope.users[index].rank+1;
        var endRank = startRank + USERS_PER_PAGE-1;

        TwitterClientService.getCompetitorsWithRank(startRank, endRank, $scope.currentTwitterSkill, function(inUsers) {
          setUsers(inUsers);
        });
      }

    };

    $scope.loadPage = function(pageNumber) {

      if(pageNumber != $scope.currentPage) {

        var startRank = (pageNumber-1) * USERS_PER_PAGE + 1;
        var endRank = startRank + USERS_PER_PAGE - 1;

        TwitterClientService.getCompetitorsWithRank(startRank, endRank, $scope.currentTwitterSkill, function(inUsers) {
          setUsers(inUsers);
          $scope.currentPage = pageNumber;
        });
      }
    };

    $scope.loadPrevious = function() {

      if($scope.currentPage > 1) {
        $scope.currentPage--;

        var endRank = $scope.users[0].rank-1;
        if(endRank == 0) {
          endRank = 25;
        }

        var startRank = endRank - USERS_PER_PAGE + 1;

        TwitterClientService.getCompetitorsWithRank(startRank, endRank, $scope.currentTwitterSkill, function(inUsers) {
          setUsers(inUsers);
        });
      }
    };

    var setUsers = function(inUsers) {

      for(var i = 0; i < USERS_PER_PAGE; i++) {
        var user = $scope.users[i];
        var inUser = inUsers[i];

        if($scope.users.length != inUsers.length) {
          if(!inUser) {  // If number of inUsers is smaller than USERS_PER_PAGE then pop elements off the array
            $scope.users.pop();
          } else if(!user) { // If number of inUsers is greater than USER_PER_PAGE then push new element on to the array
            $scope.users.push({
              rank: inUser.rank,
              screenName: inUser.screenName,
              level: inUser.level,
              experience: inUser.experience
            });
          } else {
            setUser(user, inUser);
          }
        } else {
          if(i < inUsers.length) {
            setUser(user, inUser);
          }
        }
      }
    };

    var setUser = function(user, inUser) {
      user.rank = inUser.rank;
      user.screenName = inUser.screenName;
      user.level = inUser.level;
      user.experience = inUser.experience;
    }

    init();
  });
