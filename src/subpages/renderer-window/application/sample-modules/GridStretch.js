export default {
  meta: {
    name: "Grid Stretch",
    author: "2xAA",
    version: 0.1,
    meyda: ["zcr", "rms"],
    previewWithOutput: true,
    type: "2d"
  },

  props: {
    countX: {
      label: "Grid Size X",
      type: "int",
      min: 1,
      max: 20,
      step: 1,
      default: 10
    },

    countY: {
      label: "Grid Size Y",
      type: "int",
      min: 1,
      max: 20,
      step: 1,
      default: 10
    },

    intensity: {
      label: "RMS/ZCR Intensity",
      type: "float",
      min: 0,
      max: 30,
      default: 15
    },

    zcr: {
      label: "RMS (unchecked) / ZCR (checked)",
      type: "bool",
      default: false
    }
  },

  data: {
    newCanvas2: null,
    newCtx2: null
  },

  init({ canvas, data }) {
    data.newCanvas2 = new OffscreenCanvas(canvas.width, canvas.height);
    data.newCtx2 = data.newCanvas2.getContext("2d");

    data.newCanvas2.width = canvas.width;
    data.newCanvas2.height = canvas.height;

    return data;
  },

  resize({ canvas, data }) {
    data.newCanvas2.width = canvas.width;
    data.newCanvas2.height = canvas.height;

    return data;
  },

  draw({ canvas, context, features, props, data }) {
    const sliceWidth = canvas.width / props.countX;
    const sliceHeight = canvas.height / props.countY;

    data.newCtx2.clearRect(0, 0, canvas.width, canvas.height);
    let analysed;

    if (props.zcr) {
      analysed = (features.zcr / 10) * props.intensity;
    } else {
      analysed = features.rms * 10 * props.intensity;
    }

    for (var i = props.countX; i >= 0; i--) {
      for (var j = props.countY; j >= 0; j--) {
        data.newCtx2.drawImage(
          canvas,
          i * sliceWidth,
          j * sliceHeight,
          sliceWidth,
          sliceHeight,

          i * sliceWidth - analysed,
          j * sliceHeight - analysed,
          sliceWidth + analysed * 2,
          sliceHeight + analysed * 2
        );
      }
    }

    context.drawImage(data.newCanvas2, 0, 0, canvas.width, canvas.height);
  }
};
