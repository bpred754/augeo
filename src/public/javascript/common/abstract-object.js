
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
  /* Description: Custom object mechanism                                    */
  /***************************************************************************/

  var surrogateConstructor = function() {};

  // Logic to extend classes
  exports.extend = function(base, sub, methods) {
    surrogateConstructor.prototype = base.prototype;
    sub.prototype = new surrogateConstructor();
    sub.prototype.constructor = sub;

    // Add a reference to the parent's prototype
    sub.base = base.prototype;

    // Copy the methods passed in to the prototype
    for (var name in methods) {
      sub.prototype[name] = methods[name];
    }

    // So we can define the constructor inline
    return sub;
  };

  // Generic object class
  exports.GenericObject = function(){};