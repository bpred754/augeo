
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
    profileIcon: 'image/avatar-small.png',
    skill: {
      imageSrc: 'image/augeo-logo-medium.png'
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
    skill: {
      imageSrc: 'image/twitter/logo-blue-medium.png'
    }
  };

  exports.LOGIN_USER = {
    email: exports.USER.email,
    password: exports.USER.password
  };

  exports.logData = {};
  exports.TIMEOUT = 60000;
