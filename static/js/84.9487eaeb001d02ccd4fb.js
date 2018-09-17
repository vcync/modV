webpackJsonp([84],{

/***/ 786:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
// import Meyda from 'meyda';

/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    name: 'Concentrics 2',
    author: '2xAA',
    version: '2.0.0',
    audioFeatures: ['zcr', 'rms'],
    type: '2d',
  },

  props: {
    groups: {
      type: 'group',
      default: 2,
      props: {
        spacing: {
          type: 'float',
          abs: true,
          default: 5,
        },

        groupDistance: {
          type: 'float',
          default: 10,
        },

        strokeWeight: {
          type: 'int',
          abs: true,
          default: 1,
          min: 1,
          max: 20,
        },
      },
    },
  },

  data: {
    x: [],
    y: [],
  },

  drawCircles(ctx, zcr, strokeWeight, spacing, x, y) {
    ctx.lineWidth = strokeWeight;
    // ctx.strokeStyle = `hsl(${this.hue}, 50%, 50%)`;

    for (let i = 0; i < zcr; i += 1) {
      if (i === zcr - 1) {
        // ctx.strokeStyle = `hsl(${this.hue}, 50%, ${(1 - (zcr - Math.round(zcr))) * 50}%)`;
      }

      ctx.beginPath();
      ctx.arc(x, y, i * spacing, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
    }

    // if (this.hue > 360) this.hue = 0;
    // else this.hue += 0.2;
  },

  draw({ canvas, context, features, delta }) {
    for (let i = 0; i < this.groups.length; i += 1) {
      const groupProps = this.groups.props;
      const strokeWeight = groupProps.strokeWeight[i];
      const spacing = groupProps.spacing[i];
      const groupDistance = groupProps.groupDistance[i];

      this.x[i] = ((canvas.width / 2) + Math.sin(delta / 1000) * groupDistance); //eslint-disable-line
      this.y[i] = ((canvas.height / 2) + Math.cos(delta / 1000) * (groupDistance / 2)); //eslint-disable-line

      this.drawCircles(context, features.zcr, strokeWeight, spacing, this.x[i], this.y[i]);
    }
  },
});


/***/ })

});
//# sourceMappingURL=84.9487eaeb001d02ccd4fb.js.map