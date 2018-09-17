webpackJsonp([82],{

/***/ 769:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_modv__ = __webpack_require__(20);


class Concentrics extends __WEBPACK_IMPORTED_MODULE_0_modv__["Module2D"] {
  constructor() {
    super({
      info: {
        name: 'Concentrics',
        author: '2xAA',
        version: 0.2,
        meyda: ['zcr', 'rms'],
      },
    });

    const controls = [];

    controls.push({
      type: 'checkboxControl',
      variable: 'rms',
      label: 'Use RMS',
      checked: false,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'intensity',
      label: 'RMS/ZCR Intensity',
      varType: 'int',
      min: 0,
      max: 30,
      step: 1,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'spacing',
      label: 'Circle Spacing',
      varType: 'int',
      min: 0,
      max: 100,
      step: 1,
      default: 5,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'objectDistance',
      label: 'Object Distance',
      varType: 'int',
      min: 0,
      max: 200,
      step: 1,
      default: 40,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'strokeWeight',
      label: 'Stroke Weight',
      varType: 'int',
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      strict: true,
    });

    this.add(controls);
  }

  Concentric() { //eslint-disable-line
    return function Concentric(canvas) {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.hue = Math.round(Math.random() * 360);

      this.draw = function draw(ctx, zcr, strokeWeight, spacing) {
        ctx.strokeStyle = `hsl(${this.hue}, 50%, 50%)`;
        ctx.lineWidth = strokeWeight;

        for (let i = 0; i < zcr; i += 1) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, i * spacing, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.stroke();
        }

        if (this.hue > 360) this.hue = 0;
        else this.hue += 0.2;
      };
    };
  }

  init(canvas) {
    this.rms = false;
    this.intensity = 1;
    this.spacing = 5;
    this.strokeWeight = 1;
    this.objectDistance = 40;

    this.circle1 = new (this.Concentric())(canvas);
    this.circle2 = new (this.Concentric())(canvas);
  }

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
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Concentrics);


/***/ })

});
//# sourceMappingURL=82.f208b3f396d296e164ca.js.map