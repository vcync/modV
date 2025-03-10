export default {
  meta: {
    name: "Pixelate",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["zcr", "rms"],
    type: "2d",
    previewWithOutput: true,
  },

  props: {
    pixelAmount: {
      type: "int",
      label: "Amount",
      min: 2,
      max: 30,
      step: 1,
      default: 5,
    },

    soundReactive: {
      type: "bool",
      label: "Sound Reactive",
      default: false,
    },

    intensity: {
      type: "int",
      label: "RMS/ZCR Intensity",
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    },

    soundType: {
      type: "bool",
      label: "RMS (unchecked) / ZCR (checked)",
      default: false,
    },
  },

  init({ canvas, data }) {
    data.newCanvas2 = new OffscreenCanvas(300, 300);
    data.newCtx2 = data.newCanvas2.getContext("2d");
    data.newCtx2.imageSmoothingEnabled = false;

    data.newCanvas2.width = canvas.width;
    data.newCanvas2.height = canvas.height;

    return data;
  },

  resize({ canvas, data }) {
    data.newCanvas2.width = canvas.width;
    data.newCanvas2.height = canvas.height;

    return data;
  },

  draw({ canvas, context, features, data, props }) {
    let w;
    let h;
    let analysed;

    if (props.soundReactive) {
      if (props.soundType) {
        analysed = features.zcr / (10 * props.intensity);
      } else {
        analysed = features.rms * 10 * props.intensity;
      }

      w = canvas.width / analysed;
      h = canvas.height / analysed;
    } else {
      w = canvas.width / props.pixelAmount;
      h = canvas.height / props.pixelAmount;
    }

    context.save();
    data.newCtx2.clearRect(0, 0, data.newCanvas2.width, data.newCanvas2.height);
    context.imageSmoothingEnabled = false;
    data.newCtx2.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      w,
      h,
    );
    context.drawImage(
      data.newCanvas2,
      0,
      0,
      w,
      h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    context.restore();
  },
};
