
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
  /* Description: Object that displays a circular progress bar               */
  /*  - Source: https://github.com/neoziro/circular-progress                 */
  /***************************************************************************/

  (function () {

    // List of 2D context properties
    var ctxProperties = ['fillStyle', 'font', 'globalAlpha', 'globalCompositeOperation',
          'lineCap', 'lineDashOffset', 'lineJoin', 'lineWidth',
          'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX',
          'shadowOffsetY', 'strokeStyle', 'textAlign', 'textBaseLine'];

    // Autoscale function from https://github.com/component/autoscale-canvas
    var autoscale = function (canvas) {
      var ctx = canvas.getContext('2d'),
      ratio = window.devicePixelRatio || 1;

      if (1 !== ratio) {
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.width *= ratio;
        canvas.height *= ratio;
        ctx.scale(ratio, ratio);
      }

      return canvas;
    };

    // Utility function to extend a 2D context with some options
    var extendCtx = function (ctx, options) {
      for (var i in options) {
        if (ctxProperties.indexOf(i) === -1) continue;

        ctx[i] = options[i];
      }
    };

    // Utility function to calculate the experience at a percent of progress
    var calculateExperienceAtPercent = function(startExperience, endExperience, percent) {

      var difference = endExperience - startExperience;
      var step = Math.round(difference*(percent/100));
      var displayExperience = startExperience + step;

      return displayExperience;
    };

    // Main CircularProgress object exposes on global context
    var CircularProgress = this.CircularProgress = function (options) {
      var ctx, i, property;

      options = options || {};
      this.el = document.createElement('canvas');
      this.el.width = options.canvasWidth;
      this.el.height = options.canvasHeight;
      this.options = options;

      options.text = options.text || {};
      options.text.value = options.text.value || null;

      ctx = this.el.getContext('2d');

      for (i in ctxProperties) {
        property = ctxProperties[i];
        options[property]= typeof options[property] !== 'undefined' ? options[property] : ctx[property];
      }

      if (options.radius) this.radius(options.radius);
    };

    // Update with a new `percent` value and redraw the canvas
    CircularProgress.prototype.update = function (value, isComplete) {
      this._percent = value;
      this.draw(isComplete);
      return this;
    };

    // Specify a new `radius` for the circle
    CircularProgress.prototype.radius = function (value) {
      var size = value*2;
      autoscale(this.el);
      return this;
    };

    // Draw the canvas
    CircularProgress.prototype.draw = function (isComplete) {
      var tw, text, fontSize, fontSize2, fontSize3,
          options = this.options,
          ctx = this.el.getContext('2d'),
          percent = Math.min(this._percent, 100),
          ratio = window.devicePixelRatio || 1,
          angle = Math.PI * 2 * percent / 100,
          angleOffset = .05;
          radius = options.radius,
          radiusOffset = radius*.12;
          size = (radius*2)/ratio
          half = size / 2,
          x = (this.el.width/ratio)/2,
          y = (this.el.height/ratio)/2,
          textOfsetY = 20;
          textOfsetY2 = options.radius*.6,
          level = options.text.level,
          startExperience = options.text.startExperience,
          endExperience = options.text.endExperience;

      var currentExperience;
      if(isComplete) {
        currentExperience = options.text.currentExperience;
      } else {
        currentExperience = calculateExperienceAtPercent(startExperience, endExperience, percent);
      }

      // Remove previous arc
      ctx.clearRect(0, 0, x*2, y*2);

      // Add options to context
      extendCtx(ctx, options);

      // Draw circular progress bar
      var barRadius = radius;
      var radiusPadding = barRadius*.2;
      ctx.beginPath();
      ctx.arc(x, y, barRadius-radiusPadding, 0, angle, false);
      ctx.stroke();

      // Draw triangle indicator showing end of progress
      ctx.beginPath();
      ctx.moveTo(x + (radius-radiusOffset)*Math.cos(0), y + (radius-radiusOffset)*Math.sin(0));
      ctx.lineTo(x + (radius)*Math.cos(angleOffset), y + (radius)*Math.sin(angleOffset));
      ctx.lineTo(x + (radius)*Math.cos(-angleOffset), y + (radius)*Math.sin(-angleOffset));
      ctx.fill();

      // Draw triangle indicator depending on progress percentage
      ctx.beginPath();
      ctx.moveTo(x + (radius-radiusOffset)*Math.cos(angle), y + (radius-radiusOffset)*Math.sin(angle));
      ctx.lineTo(x + (radius)*Math.cos(angle+angleOffset), y + (radius)*Math.sin(angle+angleOffset));
      ctx.lineTo(x + (radius)*Math.cos(angle-angleOffset), y + (radius)*Math.sin(angle-angleOffset));
      ctx.fill();

      // Text
      if (options.text) {
        extendCtx(ctx, options);
        extendCtx(ctx, options.text);
      }

      // Draw text
      text = options.text.value === null ? '' : options.text.value;
      tw = ctx.measureText(text).width;
      fontSize = ctx.font.match(/(\d+)px/);
      fontSize = fontSize ? fontSize[1] : 0;
      ctx.fillText(text, x - tw / 2 + 1, (y + fontSize / 2 - 1) + textOfsetY);
      ctx.save();

      // Draw level under text
      if(text != '') {
        ctx.font = 'normal normal 900 26px Arial';
      } else {
        ctx.font = 'normal normal 900 40px Arial';
      }
      var tw2 = ctx.measureText(level).width;
      fontSize2 = ctx.font.match(/(\d+)px/);
      fontSize2 = fontSize ? fontSize[1] : 0;
      ctx.textAlign="start"; //Specify the text alignment
      ctx.fillStyle = "#313131"; // Specify the font colour.
      ctx.shadowColor = "#ADADAD"; // Specify the shadow colour.
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 2; // Blur the shadow to create a bevel effect.
      ctx.fillText(level, x - tw2 / 2 + 1, (y + fontSize2 / 2 -1) + textOfsetY2);
      ctx.save();

      // Draw current experience
      ctx.fillStyle = '#000000';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = '0';
      ctx.font = 'normal normal 600 12px Arial';
      var tw3 = ctx.measureText(percent + '').width;
      fontSize3 = ctx.font.match(/(\d+)px/);
      fontSize3 = fontSize ? fontSize[1] : 0;

      var xOffset = 0;
      var yOffset = 0;

      if(angle == 0) {
        xOffset = 5;
        yOffset = 5;
      } else if(angle > 0 && angle < Math.PI/2) {
        yOffset = 10;
      } else if(angle == Math.PI/2) {
        xOffset = (ctx.measureText(currentExperience).width*-1)/2;
        yOffset = 13;
      } else if(angle > Math.PI/2 && angle < Math.PI) {
        yOffset = 10;
        xOffset = ctx.measureText(currentExperience).width*-1;
      } else if(angle == Math.PI) {
        yOffset = 5;
        xOffset = (ctx.measureText(currentExperience).width*-1)-5;
      } else if(angle > Math.PI && angle < (3*Math.PI)/2) {
        xOffset = ctx.measureText(currentExperience).width*-1;
      } else if (angle == (3*Math.PI)/2) {
        xOffset = (ctx.measureText(currentExperience).width*-1)/2;
        yOffset = -5;
      }
      ctx.fillText(currentExperience, x + (radius)*Math.cos(angle) + xOffset, y + (radius)*Math.sin(angle) + yOffset);

      // Draw end experience
      if(percent != 0 && percent != 100) {
        ctx.fillText(endExperience, x + (radius)*Math.cos(0) + 5, y + (radius)*Math.sin(0) + 5);
      }

      ctx.save();

      return this;
    };

  }).call(this);
