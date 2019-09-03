// import Meyda from 'meyda';

export default {
  meta: {
    name: "Pixelate",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["zcr", "rms"],
    type: "2d",
    previewWithOutput: true
  },

  props: {
    pixelAmount: {
      type: "int",
      label: "Amount",
      min: 2,
      max: 30,
      step: 1,
      default: 5
    },

    soundReactive: {
      type: "bool",
      label: "Sound Reactive",
      default: false
    },

    intensity: {
      type: "int",
      label: "RMS/ZCR Intensity",
      min: 0,
      max: 30,
      step: 1,
      default: 15
    },

    soundType: {
      type: "bool",
      label: "RMS (unchecked) / ZCR (checked)",
      default: false
    }
  },

  data: {
    soundType: false, // false RMS, true ZCR
    intensity: 1, // Half max
    analysed: 0,
    amount: 10,
    baseSize: 1,
    size: 2,
    color: [255, 0, 0, 1],
    speed: 1,
    balls: [],
    wrap: false
  },

  init({ canvas }) {
    this.soundReactive = false;
    this.soundType = false; // false RMS, true ZCR
    this.intensity = 15; // Half max
    this.pixelAmount = 5;

    this.newCanvas2 = new OffscreenCanvas(300, 300);
    this.newCtx2 = this.newCanvas2.getContext("2d");
    this.newCtx2.imageSmoothingEnabled = false;

    this.newCanvas2.width = canvas.width;
    this.newCanvas2.height = canvas.height;
  },

  resize({ canvas }) {
    this.newCanvas2.width = canvas.width;
    this.newCanvas2.height = canvas.height;
  },

  draw({ canvas, context, features }) {
    let w;
    let h;
    let analysed;

    if (this.soundReactive) {
      if (this.soundType) {
        analysed = features.zcr / (10 * this.intensity);
      } else {
        analysed = features.rms * 10 * this.intensity;
      }

      w = canvas.width / analysed;
      h = canvas.height / analysed;
    } else {
      w = canvas.width / this.pixelAmount;
      h = canvas.height / this.pixelAmount;
    }

    context.save();
    this.newCtx2.clearRect(0, 0, this.newCanvas2.width, this.newCanvas2.height);
    context.imageSmoothingEnabled = false;
    this.newCtx2.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      w,
      h
    );
    context.drawImage(
      this.newCanvas2,
      0,
      0,
      w,
      h,
      0,
      0,
      canvas.width,
      canvas.height
    );
    context.restore();
  }
};
