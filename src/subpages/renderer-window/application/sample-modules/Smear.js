export default {
  meta: {
    name: "Smear",
    type: "2d",
    audioFeatures: ["rms", "energy"]
  },

  props: {
    speedX: {
      type: "int",
      min: -20,
      max: 20,
      default: 0
    },
    speedY: {
      type: "int",
      min: -20,
      max: 20,
      default: 10
    },
    sizeX: {
      type: "int",
      min: -20,
      max: 20,
      default: 0
    },
    sizeY: {
      type: "int",
      min: -20,
      max: 20,
      default: 0
    }
  },

  draw({ context, canvas, props }) {
    const { width, height } = canvas;
    const { speedX, speedY, sizeX, sizeY } = props;

    context.drawImage(canvas, -speedX, -speedY, width + sizeX, height + sizeY);
  }
};
