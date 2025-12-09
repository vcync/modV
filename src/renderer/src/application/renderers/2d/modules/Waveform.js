// import Meyda from 'meyda';

export default {
  meta: {
    name: "Waveform",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["buffer"],
    type: "2d",
  },

  props: {
    strokeWeight: {
      type: "int",
      label: "Stroke",
      min: 1,
      max: 30,
      default: 1,
      abs: true,
    },

    maxHeight: {
      type: "float",
      label: "Height",
      min: 1.0,
      max: 100.0,
      default: 100.0,
    },

    maxWidth: {
      type: "float",
      label: "Width",
      min: 0,
      max: 1.0,
      default: 1.0,
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
        { label: "Sine", value: "sine" },
      ],
    },

    color: {
      type: "tween",
      component: "PaletteControl",
      default: {
        data: [
          [255, 255, 255],
          [255, 255, 255],
        ],
        duration: 10000,
        easing: "linear",
      },
    },
  },

  draw({ canvas, context, features, meyda, props }) {
    const {
      color: { value: color },
      maxWidth,
      maxHeight,
      strokeWeight,
      windowing,
    } = props;
    const { width, height } = canvas;
    const bufferLength = features.buffer.length;
    const buffer = meyda.windowing(features.buffer, windowing);

    context.lineWidth = strokeWeight;
    context.strokeStyle = `rgb(${Math.round(color[0])},${Math.round(
      color[1],
    )},${Math.round(color[2])})`;
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
  },
};
