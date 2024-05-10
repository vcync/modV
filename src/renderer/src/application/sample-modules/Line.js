export default {
  meta: {
    type: "2d",
    name: "Line",
    author: "2xAA",
  },

  props: {
    linesToShow: {
      type: "int",
      default: 100,
      min: 5,
      max: 200,
      strict: true,
    },

    spacing: {
      type: "int",
      default: 1,
      min: 1,
      max: 20,
      abs: true,
    },

    lineWidth: {
      type: "int",
      default: 1,
      min: 1,
      max: 20,
      abs: true,
    },

    color: {
      default: { r: 255, g: 255, b: 255, a: 1 },
      // explicitly define a control
      control: {
        type: "paletteControl",

        // pass options to the control
        options: {
          returnFormat: "rgbaString",
          colors: [
            { r: 255, g: 255, b: 255, a: 1 },
            { r: 0, g: 0, b: 0, a: 1 },
            { r: 255, g: 0, b: 0, a: 0.5 },
          ],
          duration: 1000,
        },
      },
    },

    speed: {
      type: "float",
      abs: true,
      min: 0,
      max: 2,
      default: 1,
    },
  },

  data: {
    vector: [
      [0, 0],
      [0, 0],
    ],
    velocity: [
      [1, 1],
      [1, 1],
    ],
    history: [],
  },

  init({ data }) {
    data.vector = [
      [Math.random(), Math.random()],
      [Math.random(), Math.random()],
    ];

    data.velocity = [
      [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1],
      [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1],
    ];

    return data;
  },

  update({ data, props, canvas: { width } }) {
    const { linesToShow, speed, spacing } = props;
    const pixel = (speed / width) * spacing;

    if (data.vector[0][0] >= 1.0 || data.vector[0][0] <= 0.0) {
      data.velocity[0][0] = -data.velocity[0][0];
    }

    if (data.vector[0][1] >= 1.0 || data.vector[0][1] <= 0.0) {
      data.velocity[0][1] = -data.velocity[0][1];
    }

    if (data.vector[1][0] >= 1.0 || data.vector[1][0] <= 0.0) {
      data.velocity[1][0] = -data.velocity[1][0];
    }

    if (data.vector[1][1] >= 1.0 || data.vector[1][1] <= 0.0) {
      data.velocity[1][1] = -data.velocity[1][1];
    }

    data.vector[0][0] += data.velocity[0][0] > 0 ? pixel : -pixel;
    data.vector[0][1] += data.velocity[0][1] > 0 ? pixel : -pixel;
    data.vector[1][0] += data.velocity[1][0] > 0 ? pixel : -pixel;
    data.vector[1][1] += data.velocity[1][1] > 0 ? pixel : -pixel;

    data.history.push(JSON.parse(JSON.stringify(data.vector)));

    if (data.history.length > linesToShow) {
      data.history.splice(0, data.history.length - linesToShow);
    }

    return data;
  },

  draw({ canvas: { width, height }, context, data }) {
    const { color, lineWidth } = this;

    context.strokeStyle = "#fff" || color;
    context.lineWidth = lineWidth;
    const hl = data.history.length;

    for (let i = 0; i < hl; i += 1) {
      const [p1, p2] = data.history[i];

      context.beginPath();
      context.moveTo(Math.round(p1[0] * width), Math.round(p1[1] * height));
      context.lineTo(Math.round(p2[0] * width), Math.round(p2[1] * height));
      context.stroke();
    }
  },
};
