import awesomeText from '@/extra/awesome-text';
import { Module2D } from '../Modules';

class Text extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Text',
        author: '2xAA',
        version: 0.1,
      },
    });

    this.add({
      type: 'textControl',
      variable: 'text',
      label: 'Text',
      default: 'modV',
    });

    this.add({
      type: 'rangeControl',
      variable: 'size',
      label: 'Size',
      append: 'pt',
      varType: 'int',
      min: 50,
      max: 200,
      default: 50,
    });

    this.add({
      type: 'textControl',
      variable: 'customFont',
      label: 'Font',
      default: 'Rubik',
    });

    this.add({
      type: 'paletteControl',
      variable: 'color',
      colors: [
        [199, 64, 163],
        [97, 214, 199],
        [222, 60, 75],
        [101, 151, 220],
        [213, 158, 151],
        [100, 132, 129],
        [154, 94, 218],
        [194, 211, 205],
        [201, 107, 152],
        [119, 98, 169],
        [214, 175, 208],
        [218, 57, 123],
        [196, 96, 98],
        [218, 74, 219],
        [138, 100, 121],
        [96, 118, 225],
        [132, 195, 223],
        [82, 127, 162],
        [209, 121, 211],
        [181, 152, 220],
      ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
      timePeriod: 500,
    });
  }

  get text() {
    return this._text; //eslint-disable-line
  }

  set text(value) {
    this.h = this.getTextHeight(this.font);
    this._text = value; //eslint-disable-line
  }

  init() {
    this.color = 'red';
    this._text = 'modV'; //eslint-disable-line
    this.size = '50pt';
    this.font = `${this.size} "Helvetica", sans-serif`;
    this.customFont = '';
    this.h = {};
  }

  draw({ canvas, context }) {
    context.textBaseline = 'middle';

    this.font = `${this.size} "${this.customFont}", sans-serif`;
    context.font = this.font;

    context.textAlign = 'left';
    context.fillStyle = this.color;

    // var w = context.measureText(this.text).width;

    // context.fillText(this.text, canvas.width/2 - w/2, canvas.height/2 + this.h.height/2);

    awesomeText(
      context,
      this.text,
      200 / 2,
      canvas.height / 2,
      Math.abs(this.h.height),
      canvas.width - 200,
    );
  }

  getTextHeight(font) { //eslint-disable-line
    const result = {};

    const text = document.createElement('span');
    text.style.font = font;
    text.textContent = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

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
}

export default Text;
