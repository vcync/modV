import { Module2D } from 'modv';

class Polygon extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Polygon',
        author: '2xAA',
        version: 0.2,
        meyda: ['rms', 'zcr'],
      },
    });

    const controls = [];

    controls.push({
      type: 'rangeControl',
      variable: 'intensity',
      label: 'RMS/ZCR Intensity',
      varType: 'int',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'shapeSize',
      label: 'Shape Size',
      varType: 'int',
      min: 0,
      max: 300,
      step: 1,
      default: 60,
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

    controls.push({
      type: 'checkboxControl',
      variable: 'fill',
      label: 'Fill',
      checked: false,
    });

    controls.push({
      type: 'checkboxControl',
      variable: 'rotateToggle',
      label: 'Rotate',
      checked: false,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'rotateSpeed',
      label: 'Rotate Speed',
      varType: 'float',
      min: 0.1,
      max: 10.0,
      step: 0.1,
      default: 5.0,
    });

    controls.push({
      type: 'paletteControl',
      variable: 'colour',
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
      timePeriod: 16,
    });

    this.add(controls);
  }

  init() {
    this.rotateToggle = false;
    this.rotateSpeed = 0.1;
    this.strokeWeight = 1;
    this.soundType = false;
    this.intensity = 15;
    this.shapeSize = 10;
    this.hue = 0;
    this.fill = false;

    this.colour = 'pink';
  }

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
  }

  draw({ canvas, context, features, delta }) {
    let analysed;
    let rotate = 0;

    if (this.rotateToggle) rotate = ((delta / 1000) * this.rotateSpeed);

    if (this.soundType) {
      analysed = (features.zcr / 10) * this.intensity;
    } else {
      analysed = (features.rms * 10) * this.intensity;
    }

    context.strokeStyle = this.colour;
    context.fillStyle = this.colour;
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
  }
}

export default Polygon;
