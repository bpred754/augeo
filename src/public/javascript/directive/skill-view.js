
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
  /* Description: Custom html element to display skill data                  */
  /***************************************************************************/

  augeo.directive('skillView', function($timeout) {
    return {
      restrict: 'AE',
      scope: {
        skill: '=',
        circleRadius: '=',
      },
      templateUrl: 'html/directive/skill-view.html',
      link: function(scope, element, attributes) {

        var createSubSkillProgressBar = function() {

          // Set sub skills
          if(scope.skill) {
            createCircularProgressBar(scope,element);
          }
        }

        // Wait for DOM to load before creating progress bar
        $timeout(createSubSkillProgressBar, 0);

        // Set main skill
        scope.$on('createCircularProgressBar', function(event, data) {
            createCircularProgressBar(data, element);

            // Set image
            var canvas = $(element).find('.augeo-canvas');

            var link = canvas.find('#image-link');
            link.attr('href', data.skill.imageLink);

            var image = canvas.find('#circular-augeo-image');
            image.attr('src', data.skill.imageSrc);
        });
      }
    }
  });

  var createCircularProgressBar = function(scope, element) {
    var n, endVal, id, progress;

    var progressCanvasContainer = $(element).find('.augeo-canvas').find('.skill-icon-container');

    canvasWidth = progressCanvasContainer.outerWidth();
    canvasHeight = $(element).parent().outerHeight();

    progress = new CircularProgress({
      radius: scope.circleRadius,
      lineWidth: 8,
      canvasWidth: 430,
      canvasHeight: canvasHeight,
      text : {
        value: scope.skill.name,
        level: scope.skill.level,
        startExperience: scope.skill.startExperience,
        currentExperience: scope.skill.experience,
        endExperience: scope.skill.endExperience,
        font: 'bold 16px arial',
      },
      initial: {
        strokeStyle: 'white',
      }
    });

    // Attach circular progress bar to directive
    progressCanvasContainer.append(progress.el);

    n = 0;
    var isComplete = false;
    endVal = scope.skill.levelProgress;
    id = setInterval(function () {
      if (n == endVal) {
        clearInterval(id);
        isComplete = true;
      }
      progress.update(n++, isComplete);
    }, 30); // speed of progress

  };

  var isSkillViewLoaded = function() {
    return true;
  }
