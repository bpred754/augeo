
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
  /* Description: Singleton that provides validating functions               */
  /***************************************************************************/

  // Reminder: Update service/index.js when service params are modified
  module.exports = function() {

    var VALID_CHARACTER_REGEX = new RegExp('^(\\w|[!@#$%^&*(){}\\[\\]|?., ])+');

    this.isEmailValid = function(email) {
      var isValid = false;

      if(email) {
        if(email.indexOf('@') != -1 && email.match(VALID_CHARACTER_REGEX)) {
          isValid = true;
        }
      }
      return isValid;
    };

    this.isPasswordValid = function(password) {
      var isValid = false;

      if(password) {
        var passwordRegex = new RegExp('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})');
        if(password.match(VALID_CHARACTER_REGEX) && password.match(passwordRegex)) {
          isValid = true;
        }
      }
      return isValid;
    };

    this.isStringAlphabetic = function(string) {
      var isValid = false;

      if(string) {
        var alphabeticRegex = new RegExp('^[a-zA-Z]+$');
        if(string.match(alphabeticRegex)) {
          isValid = true;
        }
      }
      return isValid;
    };

    this.isUsernameValid = function(username) {
      var isValid = false;

      if(username) {
        var usernameRegex = new RegExp('^[a-zA-Z0-9_]{1,15}$');
        if(username.match(usernameRegex)) {
          isValid = true;
        }
      }
      return isValid;
    };

  };
