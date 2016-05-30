
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
  /* Description: Handles logic interfacing with USER collection             */
  /***************************************************************************/

  // Required libraries
  var AugeoDB = require('../model/database');
  var AugeoValidator = require('../validator/augeo-validator');
  var Bcrypt = require('bcrypt');

  // Global variables
  var User = AugeoDB.model('User');

  exports.addUser = function(user, callback, rollback) {

    if(user) {
      if(AugeoValidator.isStringAlphabetic(user.firstName) &&
         AugeoValidator.isStringAlphabetic(user.lastName) &&
         AugeoValidator.isEmailValid(user.email) &&
         AugeoValidator.isPasswordValid(user.password)) {

           // Encrypt password
           Bcrypt.genSalt(10, function(genSaltError, salt) {

             if(genSaltError) {
               rollback();
             } else {
               Bcrypt.hash(user.password, salt, function(hashError, hash) {

                 if(hashError) {
                   rollback();
                 } else {
                   var newUser = Object.create(user);
                   newUser.password = hash;
                   User.add(newUser, callback);
                 }
               });
             }
           });
         } else {
           rollback();
         }
    } else {
      rollback();
    }

  };

  exports.checkExistingAugeoUser = function(email, callback) {

    if(AugeoValidator.isEmailValid(email)) {
      User.checkExistingAugeoUser(email, callback);
    } else {
      callback(false);
    }
  };

  exports.login = function(email, password, callback, rollback) {

    if(AugeoValidator.isEmailValid(email) && AugeoValidator.isPasswordValid(password)) {

      User.getUserWithEmail(email, function(user){

        if(user) {
          // Load hash from your password DB.
          var hash = user.password;
          Bcrypt.compare(password, hash, function(err, isMatch) {
            if(isMatch) {
              // Remove password attribute from object
              user = user.toObject();
              delete user.password;
              callback(user);
            } else {
              rollback();
            }
          });
        } else {
          rollback();
        }
      });
    } else  {
      rollback();
    }
  };

  exports.removeUser = function(email, password, callback, rollback) {

    if(AugeoValidator.isEmailValid(email)) {
      if(AugeoValidator.isPasswordValid(password)) {
        User.getUserWithEmail(email, function(user) {
          if(user) {
            // Load hash from password DB
            var hash = user.password;
            Bcrypt.compare(password, hash, function(err, isMatch) {
              if(isMatch) {
                // Remove user
                User.remove(email, function(removedUser) {
                  // Remove password attribute from object
                  removedUser = removedUser.toObject();
                  delete removedUser.password;
                  callback(false, removedUser);
                });
              } else {
                callback(true);
              }
            });
          } else {
            rollback();
          }
        });
      } else {
        callback(true);
      }
    } else {
      rollback();
    }
  };
