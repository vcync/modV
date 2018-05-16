import { Module2D } from '../Modules';

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

class Phyllotaxis extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Phyllotaxis',
        author: 'AlexJMold',
        version: 1.2,
        meyda: ['rms', 'zcr'],
      },
    });

    // <
    const controls = [];

    controls.push({
      type: 'rangeControl',
      variable: 'intensity',
      label: 'RMS/ZCR Intensity',
      varType: 'int',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    });

    controls.push({
      type: 'checkboxControl',
      variable: 'soundType',
      label: 'RMS (unchecked) / ZCR (checked)',
      checked: false,
    });

    controls.push({
      type: 'paletteControl',
      variable: 'color',
      colors: [
        [199, 64, 163],
        [97, 214, 199],
        [222, 60, 75],
        [101, 151, 220],
        [213, 158, 151],
        [100, 132, 129],
        [154, 94, 218],
        [194, 211, 205],
        [201, 107, 152],
        [119, 98, 169],
        [214, 175, 208],
        [218, 57, 123],
        [196, 96, 98],
        [218, 74, 219],
        [138, 100, 121],
        [96, 118, 225],
        [132, 195, 223],
        [82, 127, 162],
        [209, 121, 211],
        [181, 152, 220],
      ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
      timePeriod: 500,
    });

    this.add(controls);
    // >
  }

  init(canvas) {
    this.soundType = false; // false RMS, true ZCR

    this.particles = [];
    this.limit = 1500;
    this.goldenRatio = ((Math.sqrt(5) + 1) / 2) - 1;
    this.goldenAngle = this.goldenRatio * (2 * Math.PI);
    this.circleRadius = (canvas.width * 0.5) - 20;

    this.color = '#fff';

    this.setupPhyllotaxis(canvas);
  }

  resize(canvas) {
    this.particles = [];
    this.limit = 1500;
    this.goldenRatio = ((Math.sqrt(5) + 1) / 2) - 1;
    this.goldenAngle = this.goldenRatio * (2 * Math.PI);
    this.circleRadius = (canvas.width * 0.5) - 20;

    this.setupPhyllotaxis(canvas);
  }

  draw({ context, features }) {
    if (this.soundType) {
      this.analysed = (features.zcr / 10) * this.intensity;
    } else {
      this.analysed = (features.rms * 10) * this.intensity;
    }

    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].show(
        context,
        this.analysed,
        this.color,
      );
      this.particles[i].update();
    }
  }

  setupPhyllotaxis(canvas) {
    const { goldenAngle, limit, circleRadius } = this;
    this.particles = [];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const { width, height } = canvas;

    for (let i = 1; i <= limit; i += 1) {
      const particleRadius = 1;
      const ratio = i / limit;
      const angle = i * goldenAngle;
      const spiralRadius = ratio * circleRadius;
      const x = cx + (Math.cos(angle) * spiralRadius);
      const y = cy + (Math.sin(angle) * spiralRadius);

      this.particles.push(
        new (this.Particle())(width, height, x, y, particleRadius, '#fff'),
      );
    }
  }

  Particle() { //eslint-disable-line
    return function Particle(width, height, x, y, r, c) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.c = c;
      this.startX = x;
      this.startY = y;
      this.velX = 0;
      this.velY = 0;
      this.targetX = width / 2;
      this.targetY = height / 2;
      this.easing = 0.02;

      this.show = (context, radiusModifier, color) => {
        context.fillStyle = this.c;
        // context.beginPath();
        // context.arc(
        //   this.x,
        //   this.y,
        //   this.r * radiusModifier,
        //   0,
        //   2 * Math.PI,
        // );

        const size = this.r * radiusModifier;
        context.fillStyle = color;
        context.fillRect(
          this.x - (size / 2),
          this.y - (size / 2),
          size,
          size,
        );
        // context.fill();
      };

      this.update = () => {
        const d = dist(this.x, this.y, this.targetX, this.targetY);

        this.easing = d / 3500;

        // move to position
        const dx = this.targetX - this.x;
        this.x += dx * this.easing;

        const dy = this.targetY - this.y;
        this.y += dy * this.easing;

        if (d < 10) {
          this.targetX = this.startX;
          this.targetY = this.startY;
        }

        if (dist(this.x, this.y, this.startX, this.startY) < 20) {
          this.targetX = width / 2;
          this.targetY = height / 2;
        }
      };
    };
  }
}

export default Phyllotaxis;
