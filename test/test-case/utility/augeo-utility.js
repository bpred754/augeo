
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

  it('should return an array of initialized sub skills -- createSubSkills()', function(done) {

    var subSkillExperiences = new Array();
    subSkillExperiences['Books'] = 0;
    subSkillExperiences['Business'] = 90;
    subSkillExperiences['Film'] = 100;
    subSkillExperiences['Food & Drink'] = 180;
    subSkillExperiences['General'] = 2670;
    subSkillExperiences['test'] = 10000;
    subSkillExperiences['Photography'] = -1;
    subSkillExperiences['Sports'] = 'test';
    subSkillExperiences['Technology'] = undefined;

    var subSkills = AugeoUtility.createSubSkills(subSkillExperiences);
    Assert.strictEqual(subSkills.length, 9);

    var skill0 = subSkills[0];
    Assert.strictEqual(skill0.name, 'Books');
    Assert.strictEqual(skill0.glyphicon, 'glyphicon-book');
    Assert.strictEqual(skill0.experience, 0);
    Assert.strictEqual(skill0.level, 1);
    Assert.strictEqual(skill0.rank, 0);

    var skill1 = subSkills[1];
    Assert.strictEqual(skill1.name, 'Business');
    Assert.strictEqual(skill1.glyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(skill1.experience, 90);
    Assert.strictEqual(skill1.level, 2);
    Assert.strictEqual(skill1.rank, 0);

    var skill2 = subSkills[2];
    Assert.strictEqual(skill2.name, 'Film');
    Assert.strictEqual(skill2.glyphicon, 'glyphicon-film');
    Assert.strictEqual(skill2.experience, 100);
    Assert.strictEqual(skill2.level, 2);
    Assert.strictEqual(skill2.rank, 0);

    var skill3 = subSkills[3];
    Assert.strictEqual(skill3.name, 'Food & Drink');
    Assert.strictEqual(skill3.glyphicon, 'glyphicon-cutlery');
    Assert.strictEqual(skill3.experience, 180);
    Assert.strictEqual(skill3.level, 3);
    Assert.strictEqual(skill3.rank, 0);

    var skill4 = subSkills[4];
    Assert.strictEqual(skill4.name, 'General');
    Assert.strictEqual(skill4.glyphicon, 'glyphicon-globe');
    Assert.strictEqual(skill4.experience, 2670);
    Assert.strictEqual(skill4.level, 9);
    Assert.strictEqual(skill4.rank, 0);

    var skill5 = subSkills[5];
    Assert.strictEqual(skill5.name, 'Music');
    Assert.strictEqual(skill5.glyphicon, 'glyphicon-headphones');
    Assert.strictEqual(skill5.experience, 0);
    Assert.strictEqual(skill5.level, 1);
    Assert.strictEqual(skill5.rank, 0);

    var skill6 = subSkills[6];
    Assert.strictEqual(skill6.name, 'Photography');
    Assert.strictEqual(skill6.glyphicon, 'glyphicon-camera');
    Assert.strictEqual(skill6.experience, 0);
    Assert.strictEqual(skill6.level, 1);
    Assert.strictEqual(skill6.rank, 0);

    var skill7 = subSkills[7];
    Assert.strictEqual(skill7.name, 'Sports');
    Assert.strictEqual(skill7.glyphicon, 'glyphicon-bullhorn');
    Assert.strictEqual(skill7.experience, 0);
    Assert.strictEqual(skill7.level, 1);
    Assert.strictEqual(skill7.rank, 0);

    var skill8 = subSkills[8];
    Assert.strictEqual(skill8.name, 'Technology');
    Assert.strictEqual(skill8.glyphicon, 'glyphicon-phone');
    Assert.strictEqual(skill8.experience, 0);
    Assert.strictEqual(skill8.level, 1);
    Assert.strictEqual(skill8.rank, 0);

    var negativeString = AugeoUtility.createSubSkills('test');
    Assert.strictEqual(negativeString.length, 9);

    var negativeSkill1 = negativeString[1];
    Assert.strictEqual(negativeSkill1.name, 'Business');
    Assert.strictEqual(negativeSkill1.glyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(negativeSkill1.experience, 0);
    Assert.strictEqual(negativeSkill1.level, 1);
    Assert.strictEqual(negativeSkill1.rank, 0);

    var negativeUndefined= AugeoUtility.createSubSkills(undefined);
    Assert.strictEqual(negativeUndefined.length, 9);

    var negativeSkill2 = negativeUndefined[1];
    Assert.strictEqual(negativeSkill2.name, 'Business');
    Assert.strictEqual(negativeSkill2.glyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(negativeSkill2.experience, 0);
    Assert.strictEqual(negativeSkill2.level, 1);
    Assert.strictEqual(negativeSkill2.rank, 0);

    done();
  });

  it('should return glyphicon for a given skill name -- getGlyphicon()', function(done) {
    Assert.strictEqual(AugeoUtility.getGlyphicon('Books'), 'glyphicon-book');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Business'), 'glyphicon-briefcase');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Film'), 'glyphicon-film');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Food & Drink'), 'glyphicon-cutlery');
    Assert.strictEqual(AugeoUtility.getGlyphicon('General'), 'glyphicon-globe');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Music'), 'glyphicon-headphones');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Photography'), 'glyphicon-camera');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Sports'), 'glyphicon-bullhorn');
    Assert.strictEqual(AugeoUtility.getGlyphicon('Technology'), 'glyphicon-phone');

    Assert.strictEqual(AugeoUtility.getGlyphicon('test'), '');
    Assert.strictEqual(AugeoUtility.getGlyphicon(''), '');
    Assert.strictEqual(AugeoUtility.getGlyphicon(undefined), '');
    Assert.strictEqual(AugeoUtility.getGlyphicon(10), '');
    Assert.strictEqual(AugeoUtility.getGlyphicon({}), '');

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

  it('should return the correct data for the users Twitter skill -- getMainSkill()', function(done) {

    var mainSkill = AugeoUtility.getMainSkill(180);
    Assert.strictEqual(mainSkill.imageSrc, 'image/augeo-logo-medium.png');
    Assert.strictEqual(mainSkill.level, 3);
    Assert.strictEqual(mainSkill.rank, 0);

    var negativeNegative  = AugeoUtility.getMainSkill(-1);
    Assert.strictEqual(negativeNegative.level, 1);

    var negativeString  = AugeoUtility.getMainSkill('test');
    Assert.strictEqual(negativeString.level, 1);

    var negativeUndefined  = AugeoUtility.getMainSkill(undefined);
    Assert.strictEqual(negativeUndefined.level, 1);

    done();
  });

  it('should return the index of the given skill name -- getSKillIndex()', function(done) {
    Assert.strictEqual(AugeoUtility.getSkillIndex('Books'), 0);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Business'), 1);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Film'), 2);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Food & Drink'), 3);
    Assert.strictEqual(AugeoUtility.getSkillIndex('General'), 4);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Music'), 5);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Photography'), 6);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Sports'), 7);
    Assert.strictEqual(AugeoUtility.getSkillIndex('Technology'), 8);

    Assert.strictEqual(AugeoUtility.getSkillIndex('test'), -1);
    Assert.strictEqual(AugeoUtility.getSkillIndex(''), -1);
    Assert.strictEqual(AugeoUtility.getSkillIndex(undefined), -1);
    Assert.strictEqual(AugeoUtility.getSkillIndex(10), -1);
    Assert.strictEqual(AugeoUtility.getSkillIndex({}), -1);

    done();
  });

  it('should return an object with all subskills set to 0 -- initializeSubSkillsExperienceArray()', function(done) {
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
    Assert.strictEqual(negativeString.constructor, Object);
    negativeString.should.eql({});

    var negativeUndefined = AugeoUtility.initializeSubSkillsExperienceArray(undefined);
    Assert.strictEqual(negativeUndefined.constructor, Object);
    negativeUndefined.should.eql({});

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
