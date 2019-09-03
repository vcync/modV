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

  circleSize: 10,
  count: 20,

  draw({ context, canvas }) {
    const { width, height } = canvas;

    context.strokeStyle = context.fillStyle = "rgba(0,0,0,0.011)";
    context.fillRect(0, 0, width, height);

    context.drawImage(
      canvas,
      -this.speedX,
      -this.speedY,
      width + this.sizeX,
      height + this.sizeY
    );
  }
};
