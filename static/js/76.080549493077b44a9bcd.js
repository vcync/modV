webpackJsonp([76],{

/***/ 804:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
// import Meyda from 'meyda';

/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    name: 'Waveform',
    author: '2xAA',
    version: '1.0.0',
    audioFeatures: ['buffer'],
    type: '2d',
  },

  props: {
    strokeWeight: {
      type: 'int',
      label: 'Stroke',
      min: 1,
      max: 30,
      default: 1,
      strict: true,
    },

    maxHeight: {
      type: 'float',
      label: 'Height',
      min: 1.0,
      max: 100.0,
      default: 75.0,
    },

    windowing: {
      type: 'enum',
      label: 'Windowing',
      enum: [
        { label: 'Rectangular (no window)', value: 'rect' },
        { label: 'Hanning', value: 'hanning', selected: true },
        { label: 'Hamming', value: 'hamming' },
        { label: 'Blackman', value: 'blackman' },
        { label: 'Sine', value: 'sine' },
      ],
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
    strokeWeight: 1,
    windowing: 'hanning',
    maxHeight: 75,
  },

  draw({ canvas, context, features, meyda }) {
    const { width, height } = canvas;
    const bufferLength = features.buffer.length;
    const buffer = meyda.windowing(features.buffer, this.windowing);

    context.lineWidth = this.strokeWeight;
    context.strokeStyle = this.color;
    context.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i += 1) {
      const v = (buffer[i] / 100) * this.maxHeight;
      const y = (height / 2) + ((height / 2) * v);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.lineTo(width, height / 2);
    context.stroke();
  },
});


/***/ })

});
//# sourceMappingURL=76.080549493077b44a9bcd.js.map