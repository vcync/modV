// import Meyda from 'meyda';

export default {
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
  },

  data: {
    colour: 'red',
    strokeWeight: 1,
    windowing: 'hanning',
    maxHeight: 75,
  },

  draw({ canvas, context, features, meyda }) {
    const { width, height } = canvas;
    const bufferLength = features.buffer.length;
    const buffer = meyda.windowing(features.buffer, this.windowing);

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
  },
};
