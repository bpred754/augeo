
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
  /* Description: Twitter Stream mock so a stream does not have to be opened */
  /*              unit test case execution                                   */
  /***************************************************************************/

  // Required local modules
  var Events = require('events');
  var EventEmitter = new Events.EventEmitter();
  var Data = require('../data/twitter-stream-data');

  // Global variables
  var tweetCallback = function(){console.log('tweetCallback has not been set')};
  var mentionCallback = function(){console.log('mentionCallback has not been set')};
  var deleteCallback = function(){console.log('deleteCallback has not been set')};

  exports.onTweet = function(tweetFunction) {
    tweetCallback = tweetFunction;
  };

  exports.onMention = function(mentionFunction) {
    mentionCallback = mentionFunction;
  }

  exports.onDelete = function(deleteFunction) {
    deleteCallback = deleteFunction
  };

  EventEmitter.on('tweet', function() {
    tweetCallback(Data.getMostRecentTweet());
  });

  EventEmitter.on('mention', function() {
    mentionCallback(Data.getMostRecentMention());
  });

  EventEmitter.on('delete', function() {

    // TODO: Create logic in Data.js to simulate a delete
    // TODO: Place tweet in callback

    var deleteMessage = {
      id_str: 'delete_id_str',
      user_id_str: 'delete_user_id_str'
    }

    deleteCallback(deleteMessage);
  });

  exports.emitter = EventEmitter;
