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
  /* Description: Wrapper object for SendGrid library                        */
  /***************************************************************************/

  // Required Libraries
  var SendGrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
  var Request = require('request');

  // Required local modules
  var Logger = require('./logger');

  // Global Variables
  var log = new Logger();

  exports.addRecipient = function(user, callback) {

    var recipient = {
      'email': user.email,
      'first_name': user.firstName,
      'last_name': user.lastName
    };

    Request.post({
     url:'https://api.sendgrid.com/v3/contactdb/recipients',
     json:true,
     body : [recipient]
     }, function(error, response, body) {
          if(error) {
            log.warn('Failed to add '  + recipient.first_name + ' ' + recipient.last_name + ' as a SendGrid recipient.  Error: ' + error);
            callback();
          } else {
            log.info('Successfully added ' + recipient.first_name + ' ' + recipient.last_name + ' as a SendGrid recipient');
            callback(body.persisted_recipients[0]);
          }
     }).auth(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
  };

  exports.getRecipients = function(callback) {
    Request.get({
     url:'https://api.sendgrid.com/v3/contactdb/recipients'
     }, function(error, response, body) {
         if(error) {
            log.warn('Failed to retrieve list of recipients')
           callback();
         } else {
           log.info('Successfully retrieved list of recipients from SendGrid');
           callback(JSON.parse(body));
         }

     }).auth(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
  };
  
  exports.removeRecipient = function(recipientId) {
    Request.delete({
      url:'https://api.sendgrid.com/v3/contactdb/recipients',
      json:true,
      body : [
        recipientId
      ]
    }, function(){
      log.info('Successfully removed ' + recipientId + ' from SendGrid\'s contact list');
    }).auth(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
  };

  exports.sendWelcomeEmail = function (user) {

    var email = new SendGrid.Email();
    email.to = user.email;
    email.from = 'brianredd@augeo.io';
    email.setSubject(' ');
    email.addSubstitution('-name-', user.firstName);
    email.setHtml(' ');
    email.addFilter('templates', 'enable', 1);
    email.addFilter('templates', 'template_id', process.env.SENDGRID_WELCOME_TEMPLATE);

    SendGrid.send(email, function(error) {
      if(error) {
        log.warn('Failed to send welcome email to ' + user.email + '. Error: ' + error);
      } else {
        log.info('Successfully sent welcome email to ' + user.email);
      }
    });
  };