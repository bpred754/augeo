
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
