
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
  /* Description: Unit test cases for queue/twitter-stream-queue             */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var AugeoUtility = require('../../../src/utility/augeo-utility');
  var Common = require('../../data/common');
  var TwitterAddActivityTask = require('../../../src/queue-task/twitter/stream/twitter-add-activity-task');
  var TwitterData = require('../../data/twitter-data');
  var TwitterInterfaceService = require('../../../src/interface-service/twitter-interface-service');
  var TwitterService = require('../../../src/service/twitter-service');
  var TwitterStreamQueue = require('../../../src/queue/twitter-stream-queue');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');

  it('should add task to the stream queue -- addTask()', function(done) {

    var task = new TwitterAddActivityTask(TwitterData.rawStandardTweet, Common.logData);
    task.wait = 1000000;

    var queue = new TwitterStreamQueue(Common.logData);
    queue.addTask(task, Common.logData);
    
    Assert.strictEqual(queue.queue.tasks.length, 1);
    done();
  });

  it('should update users skill ranks -- finishTask()', function(done) {

    var skillIndex = AugeoUtility.getSkillIndex('General', Common.logData);

    // Get rank for USER
    User.getUserWithUsername(Common.USER.username, Common.logData, function(userBefore) {
      var userBeforeRank = userBefore.subSkills[skillIndex].rank;

      // Get rank for ACTIONEE
      User.getUserWithUsername(Common.ACTIONEE.username, Common.logData, function(actioneeBefore) {
        var actioneeBeforeRank = actioneeBefore.subSkills[skillIndex].rank;

        // Verify user has a better rank than actionee
        userBeforeRank.should.be.below(actioneeBeforeRank);

        // Get tweets for actionee
        var tweets = new Array();
        tweets.push(TwitterInterfaceService.extractTweet(TwitterData.rawStandardTweet2, false, Common.logData));

        // Add actionee tweets
        TwitterService.addTweets(actioneeBefore._id, TwitterData.ACTIONEE_TWITTER.screenName, tweets, false, Common.logData, function() {

          var queue = new TwitterStreamQueue(Common.logData);
          queue.finishTask('General', Common.logData, function() {

            User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {
              var userAfterRank = userAfter.subSkills[skillIndex].rank;

              User.getUserWithUsername(Common.ACTIONEE.username, Common.logData, function(actioneeAfter) {
                var actioneeAfterRank = actioneeAfter.subSkills[skillIndex].rank;

                // Verify users ranks swapped
                actioneeAfterRank.should.be.below(userAfterRank);
                done();
              });
            });
          });
        });
      });
    });
  });

  it('should set taskWaitTime to 0 -- prepareTask()', function(done) {

    var queue = new TwitterStreamQueue(Common.logData);
    queue.taskWaitTime = 10;

    queue.prepareTask();
    Assert.strictEqual(queue.taskWaitTime, 0);
    done();
  });