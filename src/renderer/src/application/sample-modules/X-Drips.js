export default {
  meta: {
    type: "2d",
    name: "X Drips",
  },

  props: {
    dripBaseHeight: {
      default: 70,
      type: "int",
      min: 0,
      max: 70,
    },

    insetHeight: {
      default: 15,
      type: "int",
      min: 0,
      max: 70,
    },

    maxDripHeight: {
      default: 1,
      type: "float",
      min: 0,
      max: 1,
      abs: true,
    },
  },

  data: {
    spacings: [50, 30],
    widths: [30, 50, 80],
    heights: [80, 145, 220],
    colors: ["#15216b", "#f33a58", "#f76272", "#ff9fda", "#e10079", "#a231ef"],
    color: "#000",
    pattern: [],
  },

  generatePattern({ canvas, data }) {
    const { widths, heights, spacings } = data;
    const { width } = canvas;
    const pattern = [];
    let overallWidth = 0;
    let selectedWidth = 0;
    let flip = false;

    while (overallWidth < width) {
      const selectedHeight =
        heights[Math.floor(Math.random() * heights.length)];

      const random = Math.random();

      if (flip) {
        selectedWidth = widths[Math.floor(Math.random() * widths.length)];
        pattern.push({
          type: "width",
          width: selectedWidth,
          height: selectedHeight,
          random,
        });
      } else {
        selectedWidth = spacings[Math.floor(Math.random() * spacings.length)];
        pattern.push({
          type: "space",
          width: selectedWidth,
          height: selectedHeight,
          random,
        });
      }

      overallWidth += selectedWidth;
      flip = !flip;
      selectedWidth = 0;
    }

    return pattern;
  },

  clearCircle(context, x, y, radius) {
    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, true);
    context.clip();
    context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
  },

  init({ canvas, data }) {
    data.color = data.colors[Math.floor(Math.random() * data.colors.length)];
    data.pattern = this.generatePattern({ canvas, data });
    return data;
  },

  resize({ canvas, data }) {
    data.pattern = this.generatePattern({ canvas, data });
    return data;
  },

  draw({ context, delta, data, props }) {
    const { dripBaseHeight, insetHeight, maxDripHeight } = props;
    const { color, pattern } = data;
    const { width, height } = context.canvas;

    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.fillRect(0, 0, width, dripBaseHeight + insetHeight);

    const patternLength = pattern.length;
    let x = 0;

    for (let i = 0; i < patternLength; i += 1) {
      const piece = pattern[i];
      const h =
        (piece.width / 2 + Math.sin((delta / 500) * piece.random) * 30) *
        maxDripHeight;

      if (piece.type === "width") {
        context.fillStyle = color;
        context.fillRect(x, insetHeight, piece.width, piece.height + h);
        context.beginPath();
        context.arc(
          x + piece.width / 2,
          insetHeight + piece.height + h,
          piece.width / 2,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      if (piece.type === "space") {
        context.clearRect(
          x,
          dripBaseHeight - h / 3,
          piece.width,
          insetHeight + piece.height,
        );
        this.clearCircle(
          context,
          x + piece.width / 2,
          dripBaseHeight - h / 3,
          piece.width / 2,
        );
        this.clearCircle(
          context,
          x + piece.width / 2,
          insetHeight + piece.height + dripBaseHeight - h / 3,
          piece.width / 2,
        );
      }

      x += piece.width;
    }
  },
};
