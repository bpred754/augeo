
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
  /* Description: Unit test cases for service/user-service                   */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');
  var Should = require('should');

  // Required local modules
  var Common = require('../common');
  var Mongoose = require('../../../src/model/database');
  var UserService = require('../../../src/service/user-service');

  // Global variables
  var User = Mongoose.model('User');

  // addUser
  it('should add new Augeo user to AugeoDB -- addUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.addUser -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.addUser -- in rollback, test failed **');
    };

    var invalidFirstName = {
      firstName: '!Test',
      lastName: Common.USER.lastName,
      email: Common.USER.email,
      password: Common.USER.password
    };

    UserService.addUser(invalidFirstName, callbackFailure, function() {

      var invalidLastName = {
        firstName: Common.USER.firstName,
        lastName: '!Tester',
        email: Common.USER.email,
        password: Common.USER.password
      };

      UserService.addUser(invalidLastName, callbackFailure, function() {

        var invalidEmail = {
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName,
          email: 'email',
          password: Common.USER.password
        };

        UserService.addUser(invalidEmail, callbackFailure, function() {

          var invalidPassword = {
            firstName: Common.USER.firstName,
            lastName: Common.USER.lastName,
            email: Common.USER.email,
            password: '<'
          };

          UserService.addUser(invalidPassword, callbackFailure, function() {

            UserService.addUser(Common.USER, function(user) {

              Assert.strictEqual(user.firstName, Common.USER.firstName);
              Assert.strictEqual(user.lastName, Common.USER.lastName);
              Assert.strictEqual(user.email, Common.USER.email);
              done();
            }, rollbackFailure);
          });
        });
      });
    });
  });

  // checkExistingAugeoUser
  it('should find Augeo user in AugeoDB -- checkExistingAugeoUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    UserService.checkExistingAugeoUser('email', function(userExists0) {

      Assert.strictEqual(userExists0, false);

      UserService.checkExistingAugeoUser(Common.USER.email, function(userExists1) {

        Assert.strictEqual(userExists1, true);
        done();
      });
    });
  });

  // login
  it('should login Augeo user -- login()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.login -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.login -- in rollback, test failed **');
    };

    // Invalid email
    UserService.login('email', Common.USER.password, callbackFailure, function() {

      // Invalid password
      UserService.login(Common.USER.email, 'password', callbackFailure, function() {

        UserService.login(Common.USER.email, Common.USER.password, function(user) {

          Assert.strictEqual(user.firstName, Common.USER.firstName);
          Assert.strictEqual(user.lastName, Common.USER.lastName);
          Assert.strictEqual(user.email, Common.USER.email);

          done();
        }, rollbackFailure);
      });
    });
  });

  // removeUser
  it('should remove user from USER table - removeUser()', function(done) {
    this.timeout(Common.TIMEOUT);

    var callbackFailure = function() {
      console.log('** UserService.removeUser -- in callback, test failed **');
    };

    var rollbackFailure = function() {
      console.log('** UserService.removeUser -- in rollback, test failed **');
    };

    // Add Twitter Actionee entry to USER table so it can be removed
    UserService.addUser(Common.ACTIONEE, function() {

      // Invalid email - execute rollback
      UserService.removeUser('!!!', Common.ACTIONEE.password, callbackFailure, function() {

        // Invalid password - execute callback with error
        UserService.removeUser(Common.ACTIONEE.email, null, function(error0, user0) {
          Assert.strictEqual(error0, true);
          Should.not.exist(user0);

          // User does not exist for given email - execute rollback
          UserService.removeUser('blah@blah.com', Common.ACTIONEE.password, callbackFailure, function() {

            // Password does not match password in database - execute callback with error
            UserService.removeUser(Common.ACTIONEE.email, 'password', function(error1, user1) {
              Assert.strictEqual(error1, true);
              Should.not.exist(user1);

              // Success
              UserService.removeUser(Common.ACTIONEE.email, Common.ACTIONEE.password, function(error2, user2) {
                Assert.strictEqual(error2, false);

                // Validate that returned user does not have password
                Should.not.exist(user2.password);

                // Validate that returned user is not in USER table
                User.getUserWithEmail(Common.ACTIONEE.email, function(user3) {
                  Should.not.exist(user3);
                  done();
                });
              });
            });
          });
        });
      });
    }, rollbackFailure);
  });
