
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
  /* Description: Common data used between test cases                        */
  /***************************************************************************/

  exports.USER = {
    firstName: 'Test',
    lastName: 'Tester',
    fullName: 'Test Tester',
    email: 'tester@gmail.com',
    username: 'tester',
    password: '!Test1',
    profileImg: 'image/avatar-medium.png',
    twitter: {
      twitterId: '1000000000',
      accessToken: '000',
      secretAccessToken: '000',
      screenName: 'testScreenName',
      profileImageUrl: '',
      skill: {
        imageSrc: 'image/augeo-logo-medium.png'
      }
    }
  };

  exports.ACTIONEE = {
    firstName: 'Twitter',
    lastName: 'Actionee',
    fullName: 'Twitter Actionee',
    email: 'actionee@gmail.com',
    username: 'actionee',
    password: '!Test1',
    profileImg: 'image/avatar-medium.png',
    twitter: {
      twitterId: '2000000000',
      accessToken: '100',
      secretAccessToken: '100',
      screenName: 'twitterActionee',
      profileImageUrl: 'https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs.jpg',
      skill: {
        imageSrc: 'image/twitter/logo-blue-medium.png'
      }
    }
  };

  exports.LOGIN_USER = {
    email: exports.USER.email,
    password: exports.USER.password
  };

  exports.TIMEOUT = 60000;

  /***************************************************************************/
  /* Condensed Raw Tweets                                                    */
  /***************************************************************************/

  exports.rawReplyToPostCondensed = {
    id_str: '300000000000000000',
    text: '@twitterActionee Yes, it is!',
    user: {
      screen_name: exports.USER.twitter.screenName
    },
    in_reply_to_screen_name: 'twitterActionee',
    in_reply_to_status_id_str: '621504664077373440'
  };

  exports.rawRetweetCondensed = {
    id_str: '400000000000000000',
    text: "RT @twitterActionee: I'm a ping pong master",
    user: {
      screen_name: exports.USER.twitter.screenName
    },
    in_reply_to_screen_name: null,
    in_reply_to_status_id_str: null,
    retweeted_status: {
      id_str: '584124619054952448',
      user: {
        screen_name: 'twitterActionee'
      }
    }
  };

  exports.rawTweetWithMentionCondensed = {
    id_str: '200000000000000000',
    text: '@twitterActionee ah hell yeah!',
    user: {
      screen_name: exports.USER.twitter.screenName
    },
    in_reply_to_screen_name: 'twitterActionee',
    in_reply_to_status_id_str: null
  }

  exports.standardRawTweetCondensed = {
    id_str: '100000000000000000',
    text: 'Testing local stream',
    user: {
      screen_name: exports.USER.twitter.screenName
    },
    in_reply_to_screen_name: null,
    in_reply_to_status_id_str: null
  };

  /***************************************************************************/
  /* Raw Tweets                                                              */
  /***************************************************************************/

  exports.rawMentionOfTestUser = {
    created_at: "Thu Jul 16 02:20:33 +0000 2015",
    id_str: '800000000000000000',
    text: "@testScreenName Is local stream working?",
    in_reply_to_status_id_str: null,
    in_reply_to_user_id_str: exports.USER.twitter.twitterId,
    in_reply_to_screen_name: exports.USER.twitter.screenName,
    user: {
      id_str: exports.ACTIONEE.twitter.twitterId,
      name: exports.ACTIONEE.fullName,
      screen_name: exports.ACTIONEE.twitter.screenName,
      profile_image_url_https: "https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
    },
    retweet_count: 0,
    favorite_count: 0,
    entities: {
      hashtags: [],
      user_mentions: [
        {
          indices: [0,11],
          id_str: exports.USER.twitter.twitterId,
          name: exports.USER.fullName,
          screen_name: exports.USER.twitter.screenName,
          profile_image_url_https: 'https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png'
        }
      ],
      urls: []
    },
    favorited: false,
    retweeted: false,
  };

  exports.rawRetweet = {
    id_str: '110000000000000000',
    text: 'RT @Gizmodo: A new type of Dyson sphere may be nearly impossible to detect: http://t.co/oIyRqJ2jcv http://t.co/ckTdLeuet8',
    retweet_count: 144,
    favorite_count: 0,
    created_at: 'Sat Mar 28 20:15:48 +0000 2015',
    user: {
      id_str: exports.USER.twitter.twitterId,
      name: exports.USER.fullName,
      screen_name: exports.USER.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [
        {
          indices: [3,11],
          id_str: "2890961",
          name: "Gizmodo",
          screen_name: "Gizmodo"
        }
      ],
      hashtags: [],
      urls: [
        {
          indices: [76,98],
          display_url: "gizmo.do/UDRl2pF",
          expanded_url: "http://gizmo.do/UDRl2pF",
          url: "http://t.co/oIyRqJ2jcv"
        }
      ],
      media: [
        {
          source_user_id_str: "2890961",
          source_status_id_str: "581909160134074368",
          type: "photo",
          expanded_url: "http://twitter.com/Gizmodo/status/581909160134074368/photo/1",
          display_url: "pic.twitter.com/ckTdLeuet8",
          url: "http://t.co/ckTdLeuet8",
          media_url_https: "https://pbs.twimg.com/media/CBNbTEUW8AA5Yxj.jpg",
          media_url: "http://pbs.twimg.com/media/CBNbTEUW8AA5Yxj.jpg",
          indices: [99,121],
          sizes: {
            large: {
              w:150,
              h:150
            }
          }
        },
      ],
    },
    retweeted_status: {
      id_str: "581909160134074368",
      text: "A new type of Dyson sphere may be nearly impossible to detect: http://t.co/oIyRqJ2jcv http://t.co/ckTdLeuet8",
      user: {
        id_str: "2890961",
        name: "Gizmodo",
        screen_name:"Gizmodo"
      }
    }
  };

  exports.rawRetweetOfUser = {
    id_str: '120000000000000000',
    text: 'RT @testScreenName: testing retweets',
    retweet_count: 1,
    favorite_count: 0,
    created_at: 'Tue Mar 31 20:15:48 +0000 2015',
    user: {
      id_str: exports.ACTIONEE.twitter.twitterId,
      name: exports.ACTIONEE.fullName,
      screen_name: exports.ACTIONEE.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [
        {
          indices: [3,17],
          id_str: exports.USER.twitter.twitterId,
          name: exports.USER.fullName,
          screen_name: exports.USER.twitter.screenName
        }
      ],
      hashtags: [],
      urls: []
    },
    retweeted_status: {
      id_str: '500000000000000000',
      text: 'testing retweets',
      user: {
        id_str: exports.USER.twitter.twitterId,
        name: exports.USER.fullName,
        screen_name: exports.USER.twitter.screenName
      }
    }
  };

  exports.rawStandardTweet = {
    id_str: '500000000000000000',
    text: 'testing retweets',
    retweet_count: 1,
    favorite_count: 0,
    created_at: 'Mon Mar 30 21:54:28 +0000 2015',
    user: {
      id_str: exports.USER.twitter.twitterId,
      name: exports.USER.fullName,
      screen_name: exports.USER.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [],
      hashtags: [],
      urls: []
    }
  };

  exports.rawStandardTweet2 = {
    id_str: '130000000000000000',
    text: 'blah blah',
    retweet_count: 0,
    favorite_count: 0,
    created_at: 'Mon Mar 30 21:54:28 +0000 2015',
    user: {
      id_str: exports.ACTIONEE.twitter.twitterId,
      name: exports.ACTIONEE.fullName,
      screen_name: exports.ACTIONEE.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [],
      hashtags: [],
      urls: []
    }
  };

  exports.rawTweetWithHashtag = {
    id_str: '900000000000000000',
    text: 'testing hashtag',
    retweet_count: 0,
    favorite_count: 0,
    created_at: 'Thu Dec 31 23:24:29 +0000 2015',
    user: {
      id_str: exports.USER.twitter.twitterId,
      name: exports.USER.fullName,
      screen_name: exports.USER.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [],
      hashtags: [
        {
          text: 'augeoBusiness'
        }
      ],
      urls: []
    }
  };

  exports.rawTweetWithMention = {
    id_str: '600000000000000000',
    text: '@twitterActionee Are my tweets being extracted correctly?',
    retweet_count: 0,
    favorite_count: 0,
    created_at: 'Sat Jun 20 23:24:29 +0000 2015',
    user: {
      id_str: exports.USER.twitter.twitterId,
      name: exports.USER.fullName,
      screen_name: exports.USER.twitter.screenName,
      profile_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png'
    },
    entities: {
      user_mentions: [
        {
          indices: [0,12],
          id_str: exports.ACTIONEE.twitter.twitterId,
          name: exports.ACTIONEE.fullName,
          screen_name: exports.ACTIONEE.twitter.screenName
        }
      ],
      hashtags: [],
      urls: []
    }
  };
