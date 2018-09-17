webpackJsonp([79],{

/***/ 800:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    type: '2d',
    name: 'Polygon',
    author: '2xAA',
    audioFeatures: ['rms', 'zcr'],
    version: '0.2.0',
  },

  props: {
    intensity: {
      type: 'int',
      label: 'RMS/ZCR Intensity',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    },

    shapeSize: {
      type: 'int',
      label: 'Shape Size',
      min: 0,
      max: 300,
      step: 1,
      default: 60,
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

    fill: {
      type: 'bool',
      label: 'Fill',
      default: false,
    },

    rotateToggle: {
      type: 'bool',
      label: 'Rotate',
      default: false,
    },

    rotateSpeed: {
      type: 'float',
      label: 'Rotate Speed',
      min: 0.1,
      max: 10.0,
      step: 0.1,
      default: 5.0,
    },

    color: {
      control: {
        type: 'paletteControl',
        default: { r: 199, g: 64, b: 163 },
        options: {
          colors: [
            { r: 199, g: 64, b: 163 },
            { r: 97, g: 214, b: 199 },
            { r: 222, g: 60, b: 75 },
            { r: 101, g: 151, b: 220 },
            { r: 213, g: 158, b: 151 },
            { r: 100, g: 132, b: 129 },
            { r: 154, g: 94, b: 218 },
            { r: 194, g: 211, b: 205 },
            { r: 201, g: 107, b: 152 },
            { r: 119, g: 98, b: 169 },
            { r: 214, g: 175, b: 208 },
            { r: 218, g: 57, b: 123 },
            { r: 196, g: 96, b: 98 },
            { r: 218, g: 74, b: 219 },
            { r: 138, g: 100, b: 121 },
            { r: 96, g: 118, b: 225 },
            { r: 132, g: 195, b: 223 },
            { r: 82, g: 127, b: 162 },
            { r: 209, g: 121, b: 211 },
            { r: 181, g: 152, b: 220 },
          ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
          duration: 500,
        },
      },
    },
  },

  data: {
    hue: 0,
  },

  draw({ canvas, context, features, delta }) {
    let analysed;
    let rotate = 0;

    if (this.rotateToggle) rotate = ((delta / 1000) * this.rotateSpeed);

    if (this.soundType) {
      analysed = (features.zcr / 10) * this.intensity;
    } else {
      analysed = (features.rms * 10) * this.intensity;
    }

    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.lineWidth = this.strokeWeight;

    context.beginPath();
    this.polygon(
      context,
      Math.round((canvas.width / 2)),
      Math.round((canvas.height / 2)),
      analysed + this.shapeSize,
      3 + Math.round(analysed / 10),
      -(Math.PI / 2) + rotate,
    );
    context.closePath();
    context.stroke();
    if (this.fill) context.fill();
  },

  polygon(ctx, x, y, radius, sides, startAngle, anticlockwise) { //eslint-disable-line
    if (sides < 3) return;

    let a = (Math.PI * 2) / sides;
    a = anticlockwise ? -a : a;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(startAngle);
    ctx.moveTo(radius, 0);

    for (let i = 1; i < sides; i += 1) {
      ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
    }

    ctx.closePath();
    ctx.restore();
  },
});


/***/ })

});
//# sourceMappingURL=79.3015c36dd05c8983d362.js.map