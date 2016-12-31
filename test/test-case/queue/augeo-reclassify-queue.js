
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
  /* Description: Unit test cases for queue/augeo-reclassify-queue           */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var AugeoDB = require('../../../src/model/database');
  var AugeoUtility = require('../../../src/utility/augeo-utility');
  var Common = require('../../data/common');
  var ReclassifyQueue = require('../../../src/queue/augeo-reclassify-queue');
  var ReclassifyTask = require('../../../src/queue-task/augeo/reclassify-task');

  // Global variables
  var StagedFlag = AugeoDB.model('AUGEO_STAGED_FLAG');

  it('Should add a task to the reclassify queue and only ever one task-- addTask()', function(done) {

    var reclassifyQueue = new ReclassifyQueue(Common.logData);

    var task0 = new ReclassifyTask(Common.logData);
    var task1 = new ReclassifyTask(Common.logData);

    reclassifyQueue.addTask(task0, Common.logData);
    reclassifyQueue.addTask(task1, Common.logData);

    Assert.strictEqual(1, reclassifyQueue.queue.tasks.length);
    reclassifyQueue.kill();
    done();
  });

  it('should remove all entries from the STAGED_FLAG collection and place the task back onto the queue -- finishTask()', function(done) {

    var reclassifyQueue = new ReclassifyQueue(Common.logData);
    var task0 = new ReclassifyTask(Common.logData);

    var stagedFlag = {
      activity: '585c4b55a3e3c83bfc2f46ef',
      currentClassification: 'General',
      reclassifyDate: AugeoUtility.calculateReclassifyDate(Date.now(), 0, Common.logData),
      suggestedClassification: 'Fitness',
      timestamp: Date.now(),
      username: Common.USER.username,
      votes: 100
    };

    StagedFlag.getStagedFlags(stagedFlag.reclassifyDate, Common.logData, function(stagedFlagsInit) {
      Assert.strictEqual(stagedFlagsInit.length, 0);

      // Add an entry to the STAGED_FLAG collection
      StagedFlag.addVotes(stagedFlag, Common.logData, function() {

        // Verify the entry is in the collection
        StagedFlag.getStagedFlags(stagedFlag.reclassifyDate, Common.logData, function(stagedFlagsBefore) {
          Assert.strictEqual(stagedFlagsBefore.length, 1);

          task0.executeDate = stagedFlag.reclassifyDate;
          reclassifyQueue.finishTask(task0, Common.logData, function() {

            // Verify task was added back onto the queue
            Assert.strictEqual(reclassifyQueue.queue.tasks.length, 1);
            Assert.strictEqual(reclassifyQueue.isBusy, false);

            // Verify the entry is no longer in the collection
            StagedFlag.getStagedFlags(stagedFlag.reclassifyDate, Common.logData, function(stagedFlagsAfter) {
              Assert.strictEqual(stagedFlagsAfter.length, 0);

              // Verify task is being executed
              Assert.strictEqual(reclassifyQueue.queue.tasks.length, 0);
              Assert.strictEqual(reclassifyQueue.isBusy, true);

              reclassifyQueue.kill();
              done();
            });
          });
        });
      });
    });
  });

  it('should set the task wait time to midnight -- prepareTask()', function(done) {

    var reclassifyQueue = new ReclassifyQueue(Common.logData);
    var task0 = new ReclassifyTask(Common.logData);

    reclassifyQueue.prepareTask(task0, Common.logData);
    reclassifyQueue.taskWaitTime.should.be.below(1000*60*60*24);
    done();
  });