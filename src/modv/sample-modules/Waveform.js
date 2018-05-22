import Meyda from 'meyda';
import { Module2D } from '../Modules';

class Waveform extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Waveform',
        author: '2xAA',
        version: 0.1,
        meyda: ['buffer'],
      },
    });

    this.add({
      type: 'rangeControl',
      variable: 'strokeWeight',
      label: 'Stroke',
      varType: 'int',
      min: 1,
      max: 30,
      default: 1,
      strict: true,
    });

    this.add({
      type: 'rangeControl',
      variable: 'maxHeight',
      label: 'Height',
      varType: 'float',
      min: 1,
      max: 100,
      default: 75,
    });

    this.add({
      type: 'selectControl',
      variable: 'windowing',
      label: 'Windowing',
      enum: [
        { label: 'Rectangular (no window)', value: 'rect' },
        { label: 'Hanning', value: 'hanning', selected: true },
        { label: 'Hamming', value: 'hamming' },
        { label: 'Blackman', value: 'blackman' },
        { label: 'Sine', value: 'sine' },
      ],
    });

    this.add({
      type: 'paletteControl',
      variable: 'colour',
      colors: [
        [227, 210, 131],
        [62, 169, 158],
        [190, 132, 80],
        [94, 226, 204],
        [230, 173, 120],
        [137, 218, 202],
        [167, 149, 71],
        [195, 232, 214],
        [176, 137, 101],
        [158, 225, 161],
        [230, 188, 153],
        [87, 171, 120],
        [213, 211, 191],
        [126, 159, 95],
        [147, 159, 144],
        [182, 211, 127],
        [111, 165, 141],
        [212, 201, 154],
        [159, 152, 107],
        [209, 229, 175],
      ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
      timePeriod: 500,
    });
  }

  init() {
    this.colour = 'red';
    this.strokeWeight = 1;
    this.windowing = 'hanning';
    this.maxHeight = 75;
  }

  draw({ canvas, context, features }) {
    const { width, height } = canvas;
    const bufferLength = features.buffer.length;
    const buffer = Meyda.windowing(features.buffer, this.windowing);

    context.lineWidth = this.strokeWeight;
    context.strokeStyle = this.colour;
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
  }
}

// modV.register(Waveform);
export default Waveform;
