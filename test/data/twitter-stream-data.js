
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
  /* Description: Data extracted from Twitter that is used to simulate       */
  /*              Twitter's stream connection                                */
  /***************************************************************************/

  exports.RETRIEVE_LIMIT = 2;

  exports.getMentionCount = function() {
    return mentionBank.length;
  };

  var streamMentionIndex = -1;
  exports.getMostRecentMention= function() {
    streamMentionIndex++;
    return mentionBank[mentionBank.length - 1 - streamMentionIndex];
  };

  var streamTweetIndex = -1;
  exports.getMostRecentTweet = function() {
    streamTweetIndex++;
    return tweetBank[tweetBank.length - 1 - streamTweetIndex];
  };

  exports.getOldestMention = function() {
    return mentionBank[0];
  };

  exports.getOldestTweet = function() {
    return tweetBank[0];
  };

  exports.getRawMentions = function(maxId) {
    var mentions = new Array();

    if(!maxId) {
      maxId = "9999999999999999999999999";
    }

    for(var i = 0; i < mentionBank.length; i++) {
      if(mentionBank[i].id_str <= maxId && mentions.length < exports.RETRIEVE_LIMIT) {
        mentions.push(mentionBank[i]);
      }
    }

    return mentions;
  };

  exports.getRawTweets = function(maxId) {
    var tweets = new Array();

    if(!maxId) {
      maxId = "9999999999999999999999999";
    }

    for(var i = 0; i < tweetBank.length; i++) {
      if(tweetBank[i].id_str <= maxId && tweets.length < exports.RETRIEVE_LIMIT) {
        tweets.push(tweetBank[i]);
      }
    }

    return tweets;
  };

  exports.getRawUser = function(screenName) {

    var user;
    for(var i = 0; i < userBank.length; i++) {
      if(userBank[i].screen_name == screenName) {
        user = userBank[i];
      }
    }
    return user;
  };

  exports.getSecondMostRecentMention = function() {
    return mentionBank[mentionBank.length - 2];
  }

  exports.getSecondMostRecentTweet = function() {
    return tweetBank[tweetBank.length - 2];
  }

  exports.getTweetCount = function() {
    return tweetBank.length;
  }

  /***************************************************************************/
  /* Raw Tweets                                                              */
  /***************************************************************************/

  var tweet0 = {
    created_at: "Wed Apr 13 02:29:41 +0000 2016",
    id_str: "7200764598139084801",
    text: "Progress - coming soon..",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [],
      urls: []
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 1000000000,
      id_str: "1000000000",
      name: "Test Tester",
      screen_name: "testScreenName",
      location: "Scottsdale, AZ",
      description: "Software Engineer",
      url: "https://t.co/2o0zQ76qRq",
      entities: {
        url: {
          urls: [
            {
              indices: [0,23],
              display_url: "brianredd.com",
              expanded_url: "http://brianredd.com",
              url: "https://t.co/2o0zQ76qRq"
            }
          ]
        },
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 14,
      friends_count: 97,
      listed_count: 1,
      created_at: "Tue Jan 22 21:17:08 +0000 2013",
      favourites_count: 6,
      utc_offset: -25200,
      time_zone: "Arizona",
      geo_enabled: false,
      verified: false,
      statuses_count: 67,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "000000",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_link_color: "3B94D9",
      profile_sidebar_border_color: "000000",
      profile_sidebar_fill_color: "000000",
      profile_text_color: "000000",
      profile_use_background_image: false,
      has_extended_profile: false,
      default_profile: false,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 1,
    favorited: false,
    retweeted: false,
    lang: "en",
  }

  var tweet1 = {
    created_at: "Fri Mar 25 17:19:59 +0000 2016",
    id_str: "7134151424200007681",
    text: "Are you an aspiring software engineer? Take some time to learn about Linked Lists! #LinkedList #java #cplusplus\nhttps://t.co/wVW3szFqrF",
    truncated: false,
    entities: {
      hashtags: [
        {
          indices: [83,94],
          text: "LinkedList"
        },
        {
          indices: [95,100],
          text: "java"
        },
        {
          indices: [101,111],
          text: "cplusplus"
        }
      ],
      symbols: [],
      user_mentions: [],
      urls: [
        {
          indices: [112,135],
          display_url: "brianredd.com/data-structure…",
          expanded_url: "http://brianredd.com/data-structure/linked-lists",
          url: "https://t.co/wVW3szFqrF"
        }
      ]
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 1000000000,
      id_str: "1000000000",
      name: "Test Tester",
      screen_name: "testScreenName",
      location: "Scottsdale, AZ",
      description: "Software Engineer",
      url: "https://t.co/2o0zQ76qRq",
      entities: {
        url: {
          urls: [
            {
              indices: [0,23],
              display_url: "brianredd.com",
              expanded_url: "http://brianredd.com",
              url: "https://t.co/2o0zQ76qRq"
            }
          ]
        },
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 14,
      friends_count: 97,
      listed_count: 1,
      created_at: "Tue Jan 22 21:17:08 +0000 2013",
      favourites_count: 6,
      utc_offset: -25200,
      time_zone: "Arizona",
      geo_enabled: false,
      verified: false,
      statuses_count: 67,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "000000",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_link_color: "3B94D9",
      profile_sidebar_border_color: "000000",
      profile_sidebar_fill_color: "000000",
      profile_text_color: "000000",
      profile_use_background_image: false,
      has_extended_profile: false,
      default_profile: false,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 1,
    favorite_count: 1,
    favorited: false,
    retweeted: false,
    possibly_sensitive: false,
    lang: "en",
  };

  var tweet2 = {
    created_at: "Thu Feb 11 01:59:28 +0000 2016",
    id_str: "6976008080916480001",
    text: "Curious about sorting algorithms? Check out my post on Insertion Sort! #algorithms #insertionsort #java #python https://t.co/TKnCQtRgGV",
    truncated: false,
    entities: {
      hashtags: [
        {
          indices: [71,82],
          text: "algorithms"
        },
        {
          indices: [83,97],
          text: "insertionsort"
        },
        {
          indices: [98,103],
          text: "java"
        },
        {
          indices: [104,111],
          text: "python"
        }
      ],
      symbols: [],
      user_mentions: [],
      urls: [
        {
          indices: [112,135],
          display_url: "brianredd.com/algorithm/inse…",
          expanded_url: "http://brianredd.com/algorithm/insertion-sort",
          url: "https://t.co/TKnCQtRgGV"
        }
      ]
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 1000000000,
      id_str: "1000000000",
      name: "Test Tester",
      screen_name: "testScreenName",
      location: "Scottsdale, AZ",
      description: "Software Engineer",
      url: "https://t.co/2o0zQ76qRq",
      entities: {
        url: {
          urls: [
            {
              indices: [0,23],
              display_url: "brianredd.com",
              expanded_url: "http://brianredd.com",
              url: "https://t.co/2o0zQ76qRq"
            }
          ]
        },
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 14,
      friends_count: 97,
      listed_count: 1,
      created_at: "Tue Jan 22 21:17:08 +0000 2013",
      favourites_count: 6,
      utc_offset: -25200,
      time_zone: "Arizona",
      geo_enabled: false,
      verified: false,
      statuses_count: 67,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "000000",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_link_color: "3B94D9",
      profile_sidebar_border_color: "000000",
      profile_sidebar_fill_color: "000000",
      profile_text_color: "000000",
      profile_use_background_image: false,
      has_extended_profile: false,
      default_profile: false,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 1,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    possibly_sensitive: false,
    lang: "en",
  };

  var tweet3 = {
    created_at: "Sun Feb 07 18:37:29 +0000 2016",
    id_str: "6964024184020910081",
    text: "Interested in learning about Algorithms and Data Structures? Check out my post on Selection Sort: https://t.co/VsYisqvNrs",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [],
      urls: [
        {
          indices: [98,121],
          display_url: "brianredd.com/algorithm/sele…",
          expanded_url: "http://brianredd.com/algorithm/selection-sort",
          url: "https://t.co/VsYisqvNrs"
        }
      ]
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 1000000000,
      id_str: "1000000000",
      name: "Test Tester",
      screen_name: "testScreenName",
      location: "Scottsdale, AZ",
      description: "Software Engineer",
      url: "https://t.co/2o0zQ76qRq",
      entities: {
        url: {
          urls: [
            {
              indices: [0,23],
              display_url: "brianredd.com",
              expanded_url: "http://brianredd.com",
              url: "https://t.co/2o0zQ76qRq"
            }
          ]
        },
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 14,
      friends_count: 97,
      listed_count: 1,
      created_at: "Tue Jan 22 21:17:08 +0000 2013",
      favourites_count: 6,
      utc_offset: -25200,
      time_zone: "Arizona",
      geo_enabled: false,
      verified: false,
      statuses_count: 67,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "000000",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
      profile_link_color: "3B94D9",
      profile_sidebar_border_color: "000000",
      profile_sidebar_fill_color: "000000",
      profile_text_color: "000000",
      profile_use_background_image: false,
      has_extended_profile: false,
      default_profile: false,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    possibly_sensitive: false,
    lang: "en",
  };

  /***************************************************************************/
  /* Raw Mentions                                                            */
  /***************************************************************************/

  var mention0 = {
    created_at: "Wed Apr 13 03:03:27 +0000 2016",
    id_str: "7200849584426967061",
    text: "Testing mention @testScreenName",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [
        {
          indices: [16,27],
          id_str: "1000000000",
          id: 1000000000,
          name: "Test Tester",
          screen_name: "testScreenName"
        }
      ],
      urls: []
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 2000000000,
      id_str: "2000000000",
      name: "Twitter Actionee",
      screen_name: "twitterActionee",
      location: "",
      description: "This is a test account for developing a Twitter application.",
      url: null,
      entities: {
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 2,
      friends_count: 22,
      listed_count: 2,
      created_at: "Thu Jul 31 01:10:06 +0000 2014",
      favourites_count: 4,
      utc_offset: null,
      time_zone: null,
      geo_enabled: false,
      verified: false,
      statuses_count: 137,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "C0DEED",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_link_color: "0084B4",
      profile_sidebar_border_color: "C0DEED",
      profile_sidebar_fill_color: "DDEEF6",
      profile_text_color: "333333",
      profile_use_background_image: true,
      has_extended_profile: false,
      default_profile: true,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    lang: "en",
  }

  var mention1 = {
    created_at: "Wed Apr 13 02:44:29 +0000 2016",
    id_str: "7200801851611668481",
    text: "@testScreenName When?!",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [
        {
          indices: [0,11],
          id_str: "1000000000",
          id: 1000000000,
          name: "Test Tester",
          screen_name: "testScreenName"
        }
      ],
      urls: []
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: 720076459813908480.0,
    in_reply_to_status_id_str: "720076459813908480",
    in_reply_to_user_id: 1000000000,
    in_reply_to_user_id_str: "1000000000",
    in_reply_to_screen_name: "testScreenName",
    user: {
      id: 2000000000,
      id_str: "2000000000",
      name: "Twitter Actionee",
      screen_name: "twitterActionee",
      location: "",
      description: "This is a test account for developing a Twitter application.",
      url: null,
      entities: {
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 2,
      friends_count: 22,
      listed_count: 2,
      created_at: "Thu Jul 31 01:10:06 +0000 2014",
      favourites_count: 4,
      utc_offset: null,
      time_zone: null,
      geo_enabled: false,
      verified: false,
      statuses_count: 137,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "C0DEED",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_link_color: "0084B4",
      profile_sidebar_border_color: "C0DEED",
      profile_sidebar_fill_color: "DDEEF6",
      profile_text_color: "333333",
      profile_use_background_image: true,
      has_extended_profile: false,
      default_profile: true,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    lang: "en",
  }

  var mention2 = {
    created_at: "Wed Apr 13 02:31:34 +0000 2016",
    id_str: "7200769350872842251",
    text: "Can't wait for Progress! @testScreenName",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [
        {
          indices: [25,36],
          id_str: "1000000000",
          id: 1000000000,
          name: "Test Tester",
          screen_name: "testScreenName"
        }
      ],
      urls: []
    },
    source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 2000000000,
      id_str: "2000000000",
      name: "Twitter Actionee",
      screen_name: "twitterActionee",
      location: "",
      description: "This is a test account for developing a Twitter application.",
      url: null,
      entities: {
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 2,
      friends_count: 22,
      listed_count: 2,
      created_at: "Thu Jul 31 01:10:06 +0000 2014",
      favourites_count: 4,
      utc_offset: null,
      time_zone: null,
      geo_enabled: false,
      verified: false,
      statuses_count: 137,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "C0DEED",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_link_color: "0084B4",
      profile_sidebar_border_color: "C0DEED",
      profile_sidebar_fill_color: "DDEEF6",
      profile_text_color: "333333",
      profile_use_background_image: true,
      has_extended_profile: false,
      default_profile: true,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 0,
    favorite_count: 0,
    favorited: false,
    retweeted: false,
    lang: "en",
  }

  var mention3 = {
    created_at: "Wed Jan 06 20:23:02 +0000 2016",
    id_str: "1111111111111111111",
    text: "@testScreenName Blah",
    truncated: false,
    entities: {
      hashtags: [],
      symbols: [],
      user_mentions: [
        {
          indices: [0,11],
          id_str: "1000000000",
          id: 1000000000,
          name: "Test Tester",
          screen_name: "testScreenName"
        }
      ],
      urls: []
    },
    source: "<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>",
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: null,
    in_reply_to_user_id_str: null,
    in_reply_to_screen_name: null,
    user: {
      id: 2000000000,
      id_str: "2000000000",
      name: "Twitter Actionee",
      screen_name: "twitterActionee",
      location: "",
      description: "This is a test account for developing a Twitter application.",
      url: null,
      entities: {
        description: {
          urls: []
        }
      },
      protected: false,
      followers_count: 2,
      friends_count: 22,
      listed_count: 2,
      created_at: "Thu Jul 31 01:10:06 +0000 2014",
      favourites_count: 4,
      utc_offset: null,
      time_zone: null,
      geo_enabled: false,
      verified: false,
      statuses_count: 137,
      lang: "en",
      contributors_enabled: false,
      is_translator: false,
      is_translation_enabled: false,
      profile_background_color: "C0DEED",
      profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
      profile_background_tile: false,
      profile_image_url: "http://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_image_url_https: "https://pbs.twimg.com/profile_images/500446770178965505/g2R-J08w_normal.png",
      profile_link_color: "0084B4",
      profile_sidebar_border_color: "C0DEED",
      profile_sidebar_fill_color: "DDEEF6",
      profile_text_color: "333333",
      profile_use_background_image: true,
      has_extended_profile: false,
      default_profile: true,
      default_profile_image: false,
      following: false,
      follow_request_sent: false,
      notifications: false
    },
    geo: null,
    coordinates: null,
    place: null,
    contributors: null,
    is_quote_status: false,
    retweet_count: 2,
    favorite_count: 3,
    favorited: true,
    retweeted: true,
    possibly_sensitive: false,
  }

  /***************************************************************************/
  /* Raw Users                                                               */
  /***************************************************************************/

  var user0 = {
    id_str: "1000000000",
    name: "Test Tester",
    screen_name: "testScreenName",
    location: "Scottsdale, AZ",
    profile_location: {
      id: "0a0de7bd49ef942d",
      url: "https://api.twitter.com/1.1/geo/id/0a0de7bd49ef942d.json",
      place_type: "unknown",
      name: "Scottsdale, AZ",
      full_name: "Scottsdale, AZ",
      country_code: "",
      country: "",
      contained_within: [],
      bounding_box: null
    },
    description: "Software Engineer",
    url: "https://t.co/2o0zQ76qRq",
    entities: {
      url: {
        urls: [
          {
            indices: [0,23],
            display_url: "brianredd.com",
            expanded_url: "http://brianredd.com",
            url: "https://t.co/2o0zQ76qRq"
          }
        ]
      },
      description: {
        urls: []
      }
    },
    protected: false,
    followers_count: 14,
    friends_count: 97,
    listed_count: 1,
    created_at: "Tue Jan 22 21:17:08 +0000 2013",
    favourites_count: 6,
    utc_offset: -25200,
    time_zone: "Arizona",
    geo_enabled: false,
    verified: false,
    statuses_count: 67,
    lang: "en",
    status: {
      created_at: "Wed Apr 13 02:29:41 +0000 2016",
      id: 720076459813908480.0,
      id_str: "720076459813908480",
      text: "Progress - coming soon..",
      truncated: false,
      entities: {
        hashtags: [],
        symbols: [],
        user_mentions: [],
        urls: []
      },
      source: "<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
      in_reply_to_status_id: null,
      in_reply_to_status_id_str: null,
      in_reply_to_user_id: null,
      in_reply_to_user_id_str: null,
      in_reply_to_screen_name: null,
      geo: null,
      coordinates: null,
      place: null,
      contributors: null,
      is_quote_status: false,
      retweet_count: 0,
      favorite_count: 1,
      favorited: false,
      retweeted: false,
      lang: "en"
    },
    contributors_enabled: false,
    is_translator: false,
    is_translation_enabled: false,
    profile_background_color: "000000",
    profile_background_image_url: "http://abs.twimg.com/images/themes/theme1/bg.png",
    profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme1/bg.png",
    profile_background_tile: false,
    profile_image_url: "http://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
    profile_image_url_https: "https://pbs.twimg.com/profile_images/671841456340860928/clMctOYs_normal.jpg",
    profile_link_color: "3B94D9",
    profile_sidebar_border_color: "000000",
    profile_sidebar_fill_color: "000000",
    profile_text_color: "000000",
    profile_use_background_image: false,
    has_extended_profile: false,
    default_profile: false,
    default_profile_image: false,
    following: false,
    follow_request_sent: false,
    notifications: false,
    suspended: false,
    needs_phone_verification: false,
  }

  /***************************************************************************/
  /* Init                                                                    */
  /***************************************************************************/

  var tweetBank = new Array();
  tweetBank.push(tweet0);
  tweetBank.push(tweet1);
  tweetBank.push(tweet2);
  tweetBank.push(tweet3);

  var mentionBank = new Array();
  mentionBank.push(mention0);
  mentionBank.push(mention1);
  mentionBank.push(mention2);
  mentionBank.push(mention3);

  var userBank = new Array();
  userBank.push(user0);
