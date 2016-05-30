
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
  /* Description: Unit test cases for utility/twitter-utility                */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var TwitterUtility = require('../../../src/utility/twitter-utility');

  it("should return the correct experience for a given tweet's retweet and favorite counts -- calculateTweetExperience()", function(done) {
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(2,3), 280);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(3,2), 280);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(0,0), 30);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(-1,-1), 30);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience('test',2), 130);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(2,'test'), 130);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(undefined,2), 130);
    Assert.strictEqual(TwitterUtility.calculateTweetExperience(2,undefined), 130);
    done();
  });

  it('should return an array of initialized sub skills', function(done) {

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

    var subSkills = TwitterUtility.createSubSkills(subSkillExperiences);
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

    var negativeString = TwitterUtility.createSubSkills('test');
    Assert.strictEqual(negativeString.length, 9);

    var negativeSkill1 = negativeString[1];
    Assert.strictEqual(negativeSkill1.name, 'Business');
    Assert.strictEqual(negativeSkill1.glyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(negativeSkill1.experience, 0);
    Assert.strictEqual(negativeSkill1.level, 1);
    Assert.strictEqual(negativeSkill1.rank, 0);

    var negativeUndefined= TwitterUtility.createSubSkills(undefined);
    Assert.strictEqual(negativeUndefined.length, 9);

    var negativeSkill2 = negativeUndefined[1];
    Assert.strictEqual(negativeSkill2.name, 'Business');
    Assert.strictEqual(negativeSkill2.glyphicon, 'glyphicon-briefcase');
    Assert.strictEqual(negativeSkill2.experience, 0);
    Assert.strictEqual(negativeSkill2.level, 1);
    Assert.strictEqual(negativeSkill2.rank, 0);

    done();
  });

  it('should return true when string contains a augeo hashtag -- containsAugeoHashtag()', function(done) {
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoBooks'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoBusiness'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoFilm'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoFood&Drink'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoGeneral'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoMusic'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoPhotography'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoSports'), true);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoTechnology'), true);

    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoTest'), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('augeoBook'), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('#augeoBooks'), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag('test'), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag(''), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag(undefined), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag(10), false);
    Assert.strictEqual(TwitterUtility.containsAugeoHashtag({}), false);

    done();
  });

  it('should return correct amount of experience for the type of tweet/retweet/mention -- getExperience()', function(done) {

    var tweet = {
      screenName:'testScreenName',
      experience: 1000
    };

    Assert.strictEqual(TwitterUtility.getExperience(tweet, 'testScreenName', true), 50);
    Assert.strictEqual(TwitterUtility.getExperience(tweet, 'testScreenName', false), 1000);
    Assert.strictEqual(TwitterUtility.getExperience(tweet, 'screenName', false), 30);

    Assert.strictEqual(TwitterUtility.getExperience('tweet', 'testScreenName', false), 0);
    Assert.strictEqual(TwitterUtility.getExperience(tweet, 'testScreenName', 'true'), 0);

    Assert.strictEqual(TwitterUtility.getExperience(undefined, 'testScreenName', false), 0);
    Assert.strictEqual(TwitterUtility.getExperience(tweet, undefined, false), 30);
    Assert.strictEqual(TwitterUtility.getExperience(tweet, 'testScreenName', undefined), 1000);

    done();
  });

  it('should return glyphicon for a given skill name', function(done) {
    Assert.strictEqual(TwitterUtility.getGlyphicon('Books'), 'glyphicon-book');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Business'), 'glyphicon-briefcase');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Film'), 'glyphicon-film');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Food & Drink'), 'glyphicon-cutlery');
    Assert.strictEqual(TwitterUtility.getGlyphicon('General'), 'glyphicon-globe');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Music'), 'glyphicon-headphones');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Photography'), 'glyphicon-camera');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Sports'), 'glyphicon-bullhorn');
    Assert.strictEqual(TwitterUtility.getGlyphicon('Technology'), 'glyphicon-phone');

    Assert.strictEqual(TwitterUtility.getGlyphicon('test'), '');
    Assert.strictEqual(TwitterUtility.getGlyphicon(''), '');
    Assert.strictEqual(TwitterUtility.getGlyphicon(undefined), '');
    Assert.strictEqual(TwitterUtility.getGlyphicon(10), '');
    Assert.strictEqual(TwitterUtility.getGlyphicon({}), '');

    done();
  });

  it('should return the correct data for the users Twitter skill', function(done) {

    var mainSkill = TwitterUtility.getMainSkill(180);
    Assert.strictEqual(mainSkill.imageSrc, 'image/twitter/logo-blue.png');
    Assert.strictEqual(mainSkill.imageLink, 'https://www.twitter.com');
    Assert.strictEqual(mainSkill.level, 3);
    Assert.strictEqual(mainSkill.rank, 0);

    var negativeNegative  = TwitterUtility.getMainSkill(-1);
    Assert.strictEqual(negativeNegative.level, 1);

    var negativeString  = TwitterUtility.getMainSkill('test');
    Assert.strictEqual(negativeString.level, 1);

    var negativeUndefined  = TwitterUtility.getMainSkill(undefined);
    Assert.strictEqual(negativeUndefined.level, 1);

    done();
  });

  it('should return the index of the given skill name', function(done) {
    Assert.strictEqual(TwitterUtility.getSkillIndex('Books'), 0);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Business'), 1);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Film'), 2);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Food & Drink'), 3);
    Assert.strictEqual(TwitterUtility.getSkillIndex('General'), 4);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Music'), 5);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Photography'), 6);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Sports'), 7);
    Assert.strictEqual(TwitterUtility.getSkillIndex('Technology'), 8);

    Assert.strictEqual(TwitterUtility.getSkillIndex('test'), -1);
    Assert.strictEqual(TwitterUtility.getSkillIndex(''), -1);
    Assert.strictEqual(TwitterUtility.getSkillIndex(undefined), -1);
    Assert.strictEqual(TwitterUtility.getSkillIndex(10), -1);
    Assert.strictEqual(TwitterUtility.getSkillIndex({}), -1);

    done();
  });
