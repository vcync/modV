export default {
  meta: {
    type: "2d",
    name: "Line",
    author: "2xAA"
  },

  props: {
    linesToShow: {
      type: "int",
      default: 100,
      min: 5,
      max: 200,
      strict: true
    },

    spacing: {
      type: "int",
      default: 1,
      min: 1,
      max: 20,
      abs: true
    },

    lineWidth: {
      type: "int",
      default: 1,
      min: 1,
      max: 20,
      abs: true
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
            { r: 255, g: 0, b: 0, a: 0.5 }
          ],
          duration: 1000
        }
      }
    },

    speed: {
      type: "float",
      abs: true,
      min: 0,
      max: 2,
      default: 1
    }
  },

  data: {
    vector: [[0, 0], [0, 0]],
    velocity: [[1, 1], [1, 1]],
    history: []
  },

  init() {
    this.vector = [
      [Math.random(), Math.random()],
      [Math.random(), Math.random()]
    ];

    this.velocity = [
      [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1],
      [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1]
    ];
  },

  draw({ canvas: { width, height }, context }) {
    const { color, lineWidth, speed, linesToShow, spacing } = this;
    const pixel = (speed / width) * spacing;

    if (this.vector[0][0] >= 1.0 || this.vector[0][0] <= 0.0) {
      this.velocity[0][0] = -this.velocity[0][0];
    }

    if (this.vector[0][1] >= 1.0 || this.vector[0][1] <= 0.0) {
      this.velocity[0][1] = -this.velocity[0][1];
    }

    if (this.vector[1][0] >= 1.0 || this.vector[1][0] <= 0.0) {
      this.velocity[1][0] = -this.velocity[1][0];
    }

    if (this.vector[1][1] >= 1.0 || this.vector[1][1] <= 0.0) {
      this.velocity[1][1] = -this.velocity[1][1];
    }

    this.vector[0][0] += this.velocity[0][0] > 0 ? pixel : -pixel;
    this.vector[0][1] += this.velocity[0][1] > 0 ? pixel : -pixel;
    this.vector[1][0] += this.velocity[1][0] > 0 ? pixel : -pixel;
    this.vector[1][1] += this.velocity[1][1] > 0 ? pixel : -pixel;

    this.history.push(JSON.parse(JSON.stringify(this.vector)));

    if (this.history.length > linesToShow) {
      this.history.splice(0, this.history.length - linesToShow);
    }

    context.strokeStyle = "#fff" || color;
    context.lineWidth = lineWidth;
    const hl = this.history.length;

    for (let i = 0; i < hl; i += 1) {
      const [p1, p2] = this.history[i];

      context.beginPath();
      context.moveTo(Math.round(p1[0] * width), Math.round(p1[1] * height));
      context.lineTo(Math.round(p2[0] * width), Math.round(p2[1] * height));
      context.stroke();
    }
  }
};
