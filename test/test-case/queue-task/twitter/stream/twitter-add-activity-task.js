
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
  /* Description: Unit test cases for queue-task/twitter-add-activity-task   */
  /***************************************************************************/

  // Required local modules
  var AugeoDB = require('../../../../../src/model/database');
  var Common = require('../../../../data/common');
  var TwitterAddActivityTask = require('../../../../../src/queue-task/twitter/stream/twitter-add-activity-task');
  var TwitterData = require('../../../../data/twitter-data');

  // Global variables
  var User = AugeoDB.model('AUGEO_USER');

  it('should add a tweet and action to the their respective collections -- execute()', function(done) {

    // Get user baseline experience
    User.getUserWithUsername(Common.USER.username, Common.logData, function(user) {

      var baselineExperience = user.skill.experience;

      var task = new TwitterAddActivityTask(TwitterData.rawStandardTweet, Common.logData);
      task.execute(Common.logData, function() {

        // Get user after executing task
        User.getUserWithUsername(Common.USER.username, Common.logData, function(userAfter) {

          var experience = userAfter.skill.experience;

          baselineExperience.should.be.below(experience);
          done();
        });
      });
    });
  });