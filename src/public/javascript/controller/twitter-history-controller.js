
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
  /* Description: Binds data to twitter-history.html                          */
  /***************************************************************************/

  // Reminder: Update controller/index.js when controller params are modified
  module.exports = function($scope, TwitterClientService) {

    $scope.setMember = function() {
      TwitterClientService.setMember(function(status){

        $scope.setTwitterHistoryPageData();
      });
    };

    $scope.setTwitterHistoryPageData = function() {
      TwitterClientService.getTwitterHistoryPageData(function(pageData) {

        if(pageData != 'Unauthorized') {

          $scope.tweetDTO = {
            isComplete: false,
            waitTime: pageData.tweetWaitTime
          };

          $scope.mentionDTO = {
            isComplete: false,
            waitTime: pageData.mentionWaitTime
          };

          if (pageData.tweetWaitTime == -1) {
            $scope.tweetDTO.isComplete = true;
          }

          if (pageData.mentionWaitTime == -1) {
            $scope.mentionDTO.isComplete = true;
          }

          // If the user is not a member display welcome modal
          if (pageData.isMember === false) {
            showModal();
          }

          $scope.isLoaded = true;
        }
      });
    };

    // Initialize Twitter History page
    $scope.setTwitterHistoryPageData();

  };
