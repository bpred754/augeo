
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
  /* Description: Queue to perform asynchronous tasks                        */
  /***************************************************************************/

  (function () {

    var async = {};

    function only_once(fn) {
      var called = false;
      return function() {
        if (called) throw new Error("Callback was already called.");
        called = true;
        fn.apply(root, arguments);
      }
    }

    var _isArray = Array.isArray || function (obj) {
      return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
      if (arr.forEach) {
        return arr.forEach(iterator);
      }
      for (var i = 0; i < arr.length; i += 1) {
        iterator(arr[i], i, arr);
      }
    };

    //// exported async module functions ////
    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
      if (typeof setImmediate === 'function') {
        async.nextTick = function (fn) {
          // not a direct alias for IE10 compatibility
          setImmediate(fn);
        };
        async.setImmediate = async.nextTick;
      }
      else {
        async.nextTick = function (fn) {
          setTimeout(fn, 0);
        };
        async.setImmediate = async.nextTick;
      }
    }
    else {
      async.nextTick = process.nextTick;
      if (typeof setImmediate !== 'undefined') {
        async.setImmediate = function (fn) {
          // not a direct alias for IE10 compatibility
          setImmediate(fn);
        };
      }
      else {
        async.setImmediate = async.nextTick;
      }
    }

    async.queue = function (worker, concurrency) {
      if (concurrency === undefined) {
        concurrency = 1;
      }
      function _insert(q, data, pos, callback) {
        if (!q.started){
          q.started = true;
        }
        if (!_isArray(data)) {
          data = [data];
        }
        if(data.length == 0) {
          // call drain immediately if there are no tasks
          return async.setImmediate(function() {
            if (q.drain) {
              q.drain();
            }
          });
        }
        _each(data, function(task) {
          var item = {
            data: task,
            callback: typeof callback === 'function' ? callback : null
          };

          if (pos) {
            q.tasks.unshift(item);
          } else {
            q.tasks.push(item);
          }

          if (q.saturated && q.tasks.length === q.concurrency) {
            q.saturated();
          }
          async.setImmediate(q.process);
        });
      }

      var workers = 0;
      var q = {
        tasks: [],
        concurrency: concurrency,
        saturated: null,
        empty: null,
        drain: null,
        started: false,
        paused: false,
        push: function (data, callback) {
          _insert(q, data, false, callback);
        },
        kill: function () {
          q.drain = null;
          q.tasks = [];
        },
        unshift: function (data, callback) {
          _insert(q, data, true, callback);
        },
        process: function () {
          if (!q.paused && workers < q.concurrency && q.tasks.length) {
            var task = q.tasks.shift();
            if (q.empty && q.tasks.length === 0) {
              q.empty();
            }
            workers += 1;
            var next = function () {
              workers -= 1;
              if (task.callback) {
                task.callback.apply(task, arguments);
              }
              if (q.drain && q.tasks.length + workers === 0) {
                q.drain();
              }
              q.process();
            };
            var cb = only_once(next);
            worker(task.data, cb);
          }
        },
        length: function () {
          return q.tasks.length;
        },
        running: function () {
          return workers;
        },
        idle: function() {
          return q.tasks.length + workers === 0;
        },
        pause: function () {
          if (q.paused === true) { return; }
          q.paused = true;
          q.process();
        },
        resume: function () {
          if (q.paused === false) { return; }
          q.paused = false;
          q.process();
        },
        getTaskPosition: function(attribute, value) {
          var position = -1;
          for(var i = 0; i < q.tasks.length; i++) {
            var taskData = q.tasks[i].data;
            if (taskData[attribute] != undefined) {
              if (taskData[attribute].equals(value)) {
                position = i;
                break;
              }
            }
          }
          return position;
        },
      };
      return q;
    };

    module.exports = async;

  }());
