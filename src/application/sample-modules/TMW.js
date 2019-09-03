export default {
  meta: {
    type: "2d",
    name: "TMW"
  },

  props: {
    scale: {
      type: "float",
      min: -3,
      max: 3,
      default: 1
    },

    strokeColor: {
      type: "color",
      default: "#ffffff"
    },

    strokeWidth: {
      type: "float",
      default: 1,
      min: 0,
      max: 20,
      abs: true
    },

    fillColor: {
      type: "color",
      default: "#000000"
    },

    rotate: {
      type: "float",
      min: 0,
      max: 360,
      default: 0
    },

    positionX: {
      type: "float",
      default: 0.5,
      min: 0,
      max: 1
    },

    positionY: {
      type: "float",
      default: 0.5,
      min: 0,
      max: 1
    }
  },

  data: {
    path: new Path2D(
      "M381.2,0l-23.9,111.1h-19.9h-10.2h-0.1l0-0.1l-21.7-60.2l-21.9,60.3h-0.3h-10h-20.1L229.4,0h30.1l14.8,69.1 L299.6,0h11.9l24.9,68.5L351,0H381.2z M111.6,111.1l14.7-68.5l24.9,68.5H163L188.2,42l14.8,69.1h30.1L209.3,0h-30.1h-0.3l-21.9,60.3 L135.4,0.1l0-0.1h-0.1h-30L81.4,111.1H111.6z M0,0v28.7h29.6v82.5h31.6V28.7h17.2L84.5,0H0z M302.5,62.3"
    ),
    pathWidth: 382,
    pathHeight: 112
  },

  draw({ canvas: { width, height }, context }) {
    const {
      pathWidth,
      pathHeight,
      path,
      strokeWidth,
      strokeColor,
      fillColor,
      scale,
      rotate,
      positionX,
      positionY
    } = this;

    context.translate(positionX * width, positionY * height);
    context.scale(scale, scale);
    context.rotate((rotate * Math.PI) / 180);

    context.translate(-pathWidth / 2, -pathHeight / 2);
    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeColor;
    context.fillStyle = fillColor;
    context.stroke(path);
    context.fill(path);
  }
};
