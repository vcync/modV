webpackJsonp([73],{

/***/ 785:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    name: 'Un Deux Trois',
    author: 'Vera Molnár',
    version: '1.0.0',
    audioFeatures: ['energy'],
    type: '2d',
  },

  data: {

  },

  props: {
    step: {
      type: 'int',
      min: 1,
      max: 50,
      default: 20,
    },

    lineWidth: {
      type: 'int',
      min: 1,
      max: 50,
      default: 4,
    },
  },

  draw({ canvas, context/* , features */ }) {
    context.lineWidth = this.lineWidth;
    context.lineCap = 'round';

    const { width, height } = canvas;
    const { step } = this;
    const aThirdOfHeight = height / 3;

    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        if (y < aThirdOfHeight) {
          this.drawLine(context, x, y, step, step, [0.5]);
        } else if (y < aThirdOfHeight * 2) {
          this.drawLine(context, x, y, step, step, [0.2, 0.8]);
        } else {
          this.drawLine(context, x, y, step, step, [0.1, 0.5, 0.9]);
        }
      }
    }
  },

  drawLine(context, x, y, width, height, positions) {
    context.save();
    context.translate(x + (width / 2), y + (height / 2));
    context.rotate(Math.random() * 5);
    context.translate(-(width / 2), -(height / 2));

    for (let i = 0; i <= positions.length; i += 1) {
      context.beginPath();
      context.moveTo(positions[i] * width, 0);
      context.lineTo(positions[i] * width, height);
      context.stroke();
    }

    context.restore();
  },
});


/***/ })

});
//# sourceMappingURL=73.3d3711b16668c94a0616.js.map