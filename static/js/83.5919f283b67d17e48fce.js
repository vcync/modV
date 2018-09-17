webpackJsonp([83],{

/***/ 787:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
// import Meyda from 'meyda';

/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    name: 'Concentrics',
    author: '2xAA',
    version: '1.0.0',
    audioFeatures: ['zcr', 'rms'],
    type: '2d',
  },

  props: {
    rms: {
      type: 'bool',
      variable: '',
      label: 'Use RMS',
      default: false,
    },

    intensity: {
      type: 'int',
      label: 'RMS/ZCR Intensity',
      min: 0,
      max: 30,
      step: 1,
    },

    spacing: {
      type: 'int',
      label: 'Circle Spacing',
      min: 0,
      max: 100,
      step: 1,
      default: 5,
    },

    objectDistance: {
      type: 'int',
      label: 'Object Distance',
      min: 0,
      max: 200,
      step: 1,
      default: 40,
    },

    strokeWeight: {
      type: 'int',
      label: 'Stroke Weight',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      strict: true,
    },
  },

  data: {
    soundType: false, // false RMS, true ZCR
    intensity: 1, // Half max
    analysed: 0,
    amount: 10,
    baseSize: 1,
    size: 2,
    color: [255, 0, 0, 1],
    speed: 1,
    balls: [],
    wrap: false,
  },

  init(canvas) {
    this.rms = false;
    this.intensity = 1;
    this.spacing = 5;
    this.strokeWeight = 1;
    this.objectDistance = 40;

    this.circle1 = new (this.Concentric())(canvas);
    this.circle2 = new (this.Concentric())(canvas);
  },

  draw({ canvas, context, features, delta }) {
    let zcr = features.zcr;
    if (this.rms) zcr = features.rms;

    zcr *= this.intensity;
    if (this.rms) {
      zcr *= 50;
    }

    this.circle1.x = ((canvas.width / 2) + Math.sin(delta / 1000) * this.objectDistance); //eslint-disable-line
    this.circle1.y = ((canvas.height / 2) + Math.cos(delta / 1000) * (this.objectDistance / 2)); //eslint-disable-line
    this.circle1.draw(context, zcr, this.strokeWeight, this.spacing);

    this.circle2.x = ((canvas.width / 2) + -Math.sin(delta / 1000) * this.objectDistance); //eslint-disable-line
    this.circle2.y = (canvas.height / 2) + (-Math.cos(delta / 1000) * (this.objectDistance / 2)); //eslint-disable-line
    this.circle2.draw(context, zcr, this.strokeWeight, this.spacing);
  },

  Concentric() { //eslint-disable-line
    return function Concentric(canvas) {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.hue = Math.round(Math.random() * 360);

      this.draw = function draw(ctx, zcr, strokeWeight, spacing) {
        ctx.lineWidth = strokeWeight;
        ctx.strokeStyle = `hsl(${this.hue}, 50%, 50%)`;

        for (let i = 0; i < zcr; i += 1) {
          if (i === zcr - 1) {
            ctx.strokeStyle = `hsl(${this.hue}, 50%, ${(1 - (zcr - Math.round(zcr))) * 50}%)`;
          }

          ctx.beginPath();
          ctx.arc(this.x, this.y, i * spacing, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.stroke();
        }

        if (this.hue > 360) this.hue = 0;
        else this.hue += 0.2;
      };
    };
  },
});


/***/ })

});
//# sourceMappingURL=83.5919f283b67d17e48fce.js.map