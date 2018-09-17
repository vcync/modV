webpackJsonp([7],{

/***/ 1768:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// originally from here, made modifications for the line height http://stackoverflow.com/a/37192581/1539303
function awesomeText(ctx, text, x, y, lineHeight, maxWidth, textAlign = 'center') {
  ctx.textAlign = textAlign;
  const words = text.split(' ');
  const lines = [];
  let sliceFrom = 0;

  for (let i = 0; i < words.length; i += 1) {
    const chunk = words.slice(sliceFrom, i).join(' ');
    const last = i === words.length - 1;
    const bigger = ctx.measureText(chunk).width > maxWidth;
    if (bigger) {
      lines.push(words.slice(sliceFrom, i).join(' '));
      sliceFrom = i;
    }
    if (last) {
      lines.push(words.slice(sliceFrom, words.length).join(' '));
      sliceFrom = i;
    }
  }

  let offsetX = 0;
  let offsetY = 0;

  if (textAlign === 'center') offsetX = maxWidth / 2;

  offsetY -= (lines.length - 1) * (lineHeight / 2);

  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x + offsetX, y + offsetY);
    offsetY += lineHeight;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (awesomeText);


/***/ }),

/***/ 784:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__extra_awesome_text__ = __webpack_require__(1768);
/* eslint-disable no-underscore-dangle */



function getTextHeight(font, textContent) {
  const result = {};

  const text = document.createElement('span');
  text.style.font = font;
  text.textContent = textContent;

  const block = document.createElement('div');
  block.style.display = 'inline-block';
  block.style.width = '1px';
  block.style.height = '0px';

  const div = document.createElement('div');
  div.appendChild(text);
  div.appendChild(block);

  document.body.appendChild(div);

  block.style.verticalAlign = 'baseline';
  result.ascent = block.offsetHeight - text.offsetHeight;

  block.style.verticalAlign = 'bottom';
  result.height = block.offsetHeight - text.offsetHeight;

  result.descent = result.height - result.ascent;

  div.remove();

  return result;
}

/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    name: 'Text',
    author: '2xAA',
    version: 0.1,
    type: '2d',
  },

  props: {
    text: {
      type: 'string',
      label: 'Text',
      default: 'modV',
      set(value) {
        this.h = getTextHeight(this.font, value);
      },
    },

    size: {
      type: 'int',
      label: 'Size',
      min: 1,
      max: 200,
      default: 50,
      set(value) {
        this.h = getTextHeight(`${value}pt "${this.customFont}", sans-serif`, this.text);
      },
    },

    customFont: {
      type: 'string',
      label: 'Font',
      default: 'Rubik',
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

  init() {
    this.font = `${this.size}pt "Helvetica", sans-serif`;
    this.h = getTextHeight(this.font, this.text);
  },

  draw({ canvas, context }) {
    context.textBaseline = 'middle';

    this.font = `${this.size}pt "${this.customFont}", sans-serif`;
    context.font = this.font;

    context.textAlign = 'left';
    context.fillStyle = this.color;

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__extra_awesome_text__["a" /* default */])(
      context,
      this.text,
      200 / 2,
      canvas.height / 2,
      Math.abs(this.h.height),
      canvas.width - 200,
    );
  },
});


/***/ })

});
//# sourceMappingURL=7.9b8d237ee7e74256dda7.js.map