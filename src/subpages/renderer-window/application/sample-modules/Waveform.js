// import Meyda from 'meyda';

export default {
  meta: {
    name: "Waveform",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["buffer"],
    type: "2d"
  },

  props: {
    strokeWeight: {
      type: "int",
      label: "Stroke",
      min: 1,
      max: 30,
      default: 1,
      abs: true
    },

    maxHeight: {
      type: "float",
      label: "Height",
      min: 1.0,
      max: 100.0,
      default: 100.0
    },

    maxWidth: {
      type: "float",
      label: "Width",
      min: 0,
      max: 1.0,
      default: 1.0
    },

    windowing: {
      type: "enum",
      label: "Windowing",
      default: "hanning",
      enum: [
        { label: "Rectangular (no window)", value: "rect" },
        { label: "Hanning", value: "hanning" },
        { label: "Hamming", value: "hamming" },
        { label: "Blackman", value: "blackman" },
        { label: "Sine", value: "sine" }
      ]
    },

    color: {
      control: {
        type: "paletteControl",
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
            { r: 181, g: 152, b: 220 }
          ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
          duration: 500
        }
      }
    }
  },

  draw({ canvas, context, features, meyda, props }) {
    const { maxWidth, maxHeight, strokeWeight, windowing } = props;
    const { width, height } = canvas;
    const bufferLength = features.buffer.length;
    const buffer = meyda.windowing(features.buffer, windowing);

    context.lineWidth = strokeWeight;
    // context.strokeStyle = this.color;
    context.strokeStyle = "#fff";
    context.beginPath();

    const sliceWidth = (width * maxWidth) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i += 1) {
      const v = (buffer[i] / 100) * maxHeight;
      const y = height / 2 + (height / 2) * v;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.lineTo(width * maxWidth, height / 2);
    context.stroke();
  }
};
