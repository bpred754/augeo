
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
  /* Description: Unit test cases for utility/augeo-utility                  */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoUtility = require('../../../src/utility/augeo-utility');

  it('should return correct levels for given experiences -- calculateLevel()', function(done) {
    Assert.strictEqual(AugeoUtility.calculateLevel(0), 1);
    Assert.strictEqual(AugeoUtility.calculateLevel(90), 2);
    Assert.strictEqual(AugeoUtility.calculateLevel(100), 2);
    Assert.strictEqual(AugeoUtility.calculateLevel(180), 3);
    Assert.strictEqual(AugeoUtility.calculateLevel(2670), 9);
    Assert.strictEqual(AugeoUtility.calculateLevel(3030), 10);
    Assert.strictEqual(AugeoUtility.calculateLevel(123456789), 2029);
    Assert.strictEqual(AugeoUtility.calculateLevel(-1), 1);
    Assert.strictEqual(AugeoUtility.calculateLevel(-10000), 1);
    Assert.strictEqual(AugeoUtility.calculateLevel('test'), 1);
    Assert.strictEqual(AugeoUtility.calculateLevel(undefined), 1);
    done();
  });

  it('should return correct progress for a given level and experience -- calculateLevelProgress()', function(done) {
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(1, 0), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(2, 90), .25);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(2, 100), .33);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(3, 180), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(9, 2670), .94);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(10, 3030), .55);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(2029, 123456789), .10);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(1, -1), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(1, -10000), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress('test', -1), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(1, 'test'), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(undefined, -1), 0);
    Assert.strictEqual(AugeoUtility.calculateLevelProgress(1, undefined), 0);
    done();
  });

  it('should return an array with all subskills set to 0 -- initializeSubSkillsExperienceArray()', function(done) {
    var subSkills= new Array();
    subSkills.push({name:'skill1'});
    subSkills.push({name:'skill2'});
    subSkills.push({name:'skill3'});

    var subSkillExperiences = AugeoUtility.initializeSubSkillsExperienceArray(subSkills);
    Assert.strictEqual(subSkillExperiences['skill1'], 0);
    Assert.strictEqual(subSkillExperiences['skill2'], 0);
    Assert.strictEqual(subSkillExperiences['skill3'], 0);
    Assert.strictEqual(subSkillExperiences['skill4'], undefined);

    var negativeString = AugeoUtility.initializeSubSkillsExperienceArray('test');
    Assert.strictEqual(negativeString.constructor, Array);
    Assert.strictEqual(negativeString.length, 0);

    var negativeUndefined = AugeoUtility.initializeSubSkillsExperienceArray(undefined);
    Assert.strictEqual(negativeUndefined.constructor, Array);
    Assert.strictEqual(negativeUndefined.length, 0);

    done();
  });

  it('should return correct end experience for a given level -- getLevelEndExperience()', function(done) {
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(2), 180);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(3), 360);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(4), 600);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(8), 2160);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(9), 2700);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(10), 3300);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(2029), 123566100);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(0), 0);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(-1), 0);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(-10000), 0);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience('test'), 0);
    Assert.strictEqual(AugeoUtility.getLevelEndExperience(undefined), 0);
    done();
  });

  it('should return correct start experience for a given level -- getLevelStartExperience()', function(done) {
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(2), 60);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(3), 180);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(4), 360);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(8), 1680);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(9), 2160);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(10), 2700);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(2029), 123444360);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(0), 0);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(-1), 0);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(-10000), 0);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience('test'), 0);
    Assert.strictEqual(AugeoUtility.getLevelStartExperience(undefined), 0);
    done();
  });

  it('should return an array without the first element -- trimArray()', function(done) {
    var array = new Array();
    array.push(1);
    array.push(2);
    array.push(3);
    array.push(4);
    Assert.strictEqual(array.length, 4);

    array = AugeoUtility.trimArray(array);
    Assert.strictEqual(array.length, 3);
    Assert.strictEqual(array[0], 2);
    Assert.strictEqual(array[1], 3);
    Assert.strictEqual(array[2], 4);

    var negativeString = AugeoUtility.trimArray('test');
    Assert.strictEqual(negativeString.constructor, Array);
    Assert.strictEqual(negativeString.length, 0);

    var negativeUndefined = AugeoUtility.trimArray(undefined);
    Assert.strictEqual(negativeUndefined.constructor, Array);
    Assert.strictEqual(negativeUndefined.length, 0);

    done();
  });
