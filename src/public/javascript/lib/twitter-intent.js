
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
  /* Description: Twitter intents handler                                    */
  /***************************************************************************/

  module.exports = function() {

    (function () {
      if (window.__twitterIntentHandler) return;
      var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
        windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
        width = 550,
        height = 420,
        winHeight = screen.height,
        winWidth = screen.width;

      function handleIntent(e) {
        e = e || window.event;
        var target = e.target || e.srcElement,
          m, left, top;

        while (target && target.nodeName.toLowerCase() !== 'a') {
          target = target.parentNode;
        }

        if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
          m = target.href.match(intentRegex);
          if (m) {
            left = Math.round((winWidth / 2) - (width / 2));
            top = 0;

            if (winHeight > height) {
              top = Math.round((winHeight / 2) - (height / 2));
            }

            window.open(target.href, 'intent', windowOptions + ',width=' + width +
              ',height=' + height + ',left=' + left + ',top=' + top);
            e.returnValue = false;
            e.preventDefault && e.preventDefault();
          }
        }
      }

      if (document.addEventListener) {
        document.addEventListener('click', handleIntent, false);
      } else if (document.attachEvent) {
        document.attachEvent('onclick', handleIntent);
      }
      window.__twitterIntentHandler = true;
    }());
  };

