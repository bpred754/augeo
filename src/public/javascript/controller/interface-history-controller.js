
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
  module.exports = function($scope, InterfaceClientService) {

    InterfaceClientService.getQueueWaitTimes('github-api', function(githubWaitTimes) {
      InterfaceClientService.getQueueWaitTimes('twitter-api', function(twitterWaitTimes) {

        if(githubWaitTimes != 'Unauthorized' || twitterWaitTimes != 'Unauthorized') {

          if (githubWaitTimes && githubWaitTimes.length == 1) {
            $scope.commitDTO = {
              isComplete: (githubWaitTimes[0] == -1) ? true : false,
              waitTime: githubWaitTimes[0]
            };
          }

          if (twitterWaitTimes && twitterWaitTimes.length == 2) {

            // Tweets are the first entry in the twitterWaitTimes array
            $scope.tweetDTO = {
              isComplete: (twitterWaitTimes[0] == -1) ? true : false,
              waitTime: twitterWaitTimes[0]
            };

            // Mentions are the second entry in the twitterWaitTimes array
            $scope.mentionDTO = {
              isComplete: (twitterWaitTimes[1] == -1) ? true : false,
              waitTime: twitterWaitTimes[1]
            };
          }

          $scope.isLoaded = true;
        }
      });
    });
  };
