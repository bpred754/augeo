
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
  /* Description: Unit test cases for validator/augeo-validator              */
  /***************************************************************************/

  // Required libraries
  var Assert = require('assert');

  // Required local modules
  var AugeoValidator = require('../../../src/validator/augeo-validator');
  var Common = require('../common');

  // isEmailValid - negative
  it('should return false for invalid email - isEmailValid()', function(done) {

    var invalidEmail = 'testemail.com';
    var isEmailValid = AugeoValidator.isEmailValid(invalidEmail, Common.logData);
    Assert.strictEqual(isEmailValid, false);

    done();
  });

  // isEmailValid - positive
  it('should return false for valid email - isEmailValid()', function(done) {

    var email = 'test@test.com';
    var isEmailValid = AugeoValidator.isEmailValid(email, Common.logData);
    Assert.strictEqual(isEmailValid, true);

    done();
  });

  // isMongooseObjectIdValid - negative
  it('should return false for invalid Mongoose objectID - isMongooseObjectId', function(done) {

    var invalidObjectId = 'ABCDEFGHIJKLMNOPQRSTUVWX';
    var isObjectIdValid = AugeoValidator.isMongooseObjectIdValid(invalidObjectId, Common.logData);
    Assert.strictEqual(isObjectIdValid, false);

    done();
  });

  // isMongooseObjectIdValid - positive
  it('should return true for valid Mongoose ObjectID - isMongooseObjectId', function(done) {

    var objectId = 'ABCDEFABCDEFABCDEFABCDEF';
    var isObjectIdValid = AugeoValidator.isMongooseObjectIdValid(objectId, Common.logData);
    Assert.strictEqual(isObjectIdValid, true);

    done();
  });

  // isNumberValid - negative
  it('should return false for invalid number - isNumberValid()', function(done) {

    var invalidNumber = 'a';
    var isNumberValid = AugeoValidator.isNumberValid(invalidNumber, Common.logData);
    Assert.strictEqual(isNumberValid, false);

    done();
  });

  // isNumberValid - positive
  if('should return true for valid number - isNumberValid()', function(done) {

    var number = '0';
    var isNumberValid = AugeoValidator.isNumberValid(number, Common.logData);
    Assert.strictEqual(isNumberValid, true);

    done();
  });

  // isPasswordValid - negative
  it('should return false for invalid password - isPasswordValid()', function(done) {

    var invalidPassword = 'password';
    var isPasswordValid = AugeoValidator.isPasswordValid(invalidPassword, Common.logData);
    Assert.strictEqual(isPasswordValid, false);

    done();
  });

  // isPasswordValid - positive
  it('should return true for valid password - isPasswordValid()', function(done) {

    var password = '!Test1';
    var isPasswordValid = AugeoValidator.isPasswordValid(password, Common.logData);
    Assert.strictEqual(isPasswordValid, true);

    done();
  });

  // isSessionValid - negative
  it('should return false for invalid session - isSessionValid()', function(done) {

    // Missing username and _id
    var request = {
      session: {
        user: {
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName
        }
      }
    };

    var isSessionValid = AugeoValidator.isSessionValid(request, Common.logData);
    Assert.strictEqual(isSessionValid, false);

    done();
  });

  // isSessionValid - positive
  it('should return true for valid session - isSessionValid()', function(done) {

    var request = {
      session: {
        user: {
          _id: '001',
          firstName: Common.USER.firstName,
          lastName: Common.USER.lastName,
          username: Common.USER.username
        }
      }
    };

    var isSessionValid = AugeoValidator.isSessionValid(request, Common.logData);
    Assert.strictEqual(isSessionValid, true);

    done();
  });

  // isSkillValid - negative
  it('should return false for invalid skill - isSkillValid()', function(done) {

    var invalidSkill = 'test';
    var isSkillValid = AugeoValidator.isSkillValid(invalidSkill, Common.logData);
    Assert.strictEqual(isSkillValid, false);

    done();
  });

  // isSkillValid - positive
  it('should return true for valid skill - isSkillValid()', function(done) {

    var skill = 'General';
    var isSkillValid = AugeoValidator.isSkillValid(skill, Common.logData);
    Assert.strictEqual(isSkillValid, true);

    done();
  });

  // isStringAlphabetic - negative
  it('should return false for invalid string - isStringAlphabetic()', function(done) {

    var invalidString = 'test0'
    var isStringAlphabetic = AugeoValidator.isStringAlphabetic(invalidString, Common.logData);
    Assert.strictEqual(isStringAlphabetic, false);

    done();
  });

  // isStringAlphabetic - positive
  it('should return true for valid string - isStringAlphabetic()', function(done) {

    var string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var isStringAlphabetic = AugeoValidator.isStringAlphabetic(string, Common.logData);
    Assert.strictEqual(isStringAlphabetic, true);

    done();
  });

  // isTimestampValid - negative
  it('should return false for invalid timestamp - isTimestampValid()', function(done) {

    var invalid = new Date('');
    var isValid = AugeoValidator.isTimestampValid(invalid, Common.logData);
    Assert.strictEqual(isValid, false);

    done();
  });

  // isTimestampValid - positive
  it('should return true for valid timestamp - isTimestampValid()', function(done) {

    var valid = new Date();
    var isValid = AugeoValidator.isTimestampValid(valid, Common.logData);
    Assert.strictEqual(isValid, true);

    done();
  });

  // isUsernameValid - negative
  it('should return false for invalid username - isUsernameValid()', function(done) {

    var invalidUsername = 'user name';
    var isUsernameValid = AugeoValidator.isUsernameValid(invalidUsername, Common.logData);
    Assert.strictEqual(isUsernameValid, false);

    done();
  });

  // isUsernameValid - positive
  it('should return true for valid username - isUsernameValid()', function(done) {

    var username = 'user_name';
    var isUsernameValid = AugeoValidator.isUsernameValid(username, Common.logData);
    Assert.strictEqual(isUsernameValid, true);

    done();
  });
