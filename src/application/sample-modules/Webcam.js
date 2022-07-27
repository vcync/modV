export default {
  meta: {
    type: "2d",
    name: "Webcam",
    author: "2xAA",
    version: "1.0.0"
  },

  props: {
    scale: {
      type: "float",
      min: 0,
      max: 10,
      default: 1
    },

    position: {
      type: "vec2",
      default: [0.5, 0.5],
      min: 0,
      max: 1
    },

    imageSmoothing: {
      type: "bool",
      default: true
    }
  },

  draw({ canvas, context, video: { canvas: video }, props }) {
    const { position, scale, imageSmoothing } = props;
    const { width: videoWidth, height: videoHeight } = video;
    const { width, height } = canvas;

    context.imageSmoothingEnabled = imageSmoothing;

    context.drawImage(
      video,
      width * position[0] - (videoWidth * scale) / 2,
      height * (1 - position[1]) - (videoHeight * scale) / 2,
      videoWidth * scale,
      videoHeight * scale
    );
  }
};
