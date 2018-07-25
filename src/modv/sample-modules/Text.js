/* eslint-disable no-underscore-dangle */

import awesomeText from '@/extra/awesome-text';

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

export default {
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

    // color: {
    //   control: {
    //     type: 'paletteControl',
    //     options: {
    //       colors: [
    //         [199, 64, 163],
    //         [97, 214, 199],
    //         [222, 60, 75],
    //         [101, 151, 220],
    //         [213, 158, 151],
    //         [100, 132, 129],
    //         [154, 94, 218],
    //         [194, 211, 205],
    //         [201, 107, 152],
    //         [119, 98, 169],
    //         [214, 175, 208],
    //         [218, 57, 123],
    //         [196, 96, 98],
    //         [218, 74, 219],
    //         [138, 100, 121],
    //         [96, 118, 225],
    //         [132, 195, 223],
    //         [82, 127, 162],
    //         [209, 121, 211],
    //         [181, 152, 220],
    //       ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
    //       timePeriod: 500,
    //     },
    //   },
    // },
  },

  init() {
    this.color = 'red';
    this.font = `${this.size}pt "Helvetica", sans-serif`;
    this.h = getTextHeight(this.font, this.text);
  },

  draw({ canvas, context }) {
    context.textBaseline = 'middle';

    this.font = `${this.size}pt "${this.customFont}", sans-serif`;
    context.font = this.font;

    context.textAlign = 'left';
    context.fillStyle = this.color;

    awesomeText(
      context,
      this.text,
      200 / 2,
      canvas.height / 2,
      Math.abs(this.h.height),
      canvas.width - 200,
    );
  },
};
