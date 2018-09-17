webpackJsonp([81],{

/***/ 797:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/* harmony default export */ __webpack_exports__["default"] = ({
  meta: {
    type: '2d',
    name: 'Phyllotaxis',
    author: 'Alex J. Mold',
    version: '1.2.0',
    audioFeatures: ['rms', 'zcr'],
  },

  props: {
    intensity: {
      type: 'int',
      label: 'RMS/ZCR Intensity',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    },

    soundType: {
      type: 'bool',
      label: 'RMS (unchecked) / ZCR (checked)',
      default: false,
    },

    color: {
      control: {
        type: 'paletteControl',
        default: { r: 199, g: 64, b: 163 },
        options: {
          colors: [
            { r: 199, g: 64, b: 163 },
            { r: 97, g: 214, b: 199 },
            { r: 222, g: 60, b: 75 },
            { r: 101, g: 151, b: 220 },
            { r: 213, g: 158, b: 151 },
            { r: 100, g: 132, b: 129 },
            { r: 154, g: 94, b: 218 },
            { r: 194, g: 211, b: 205 },
            { r: 201, g: 107, b: 152 },
            { r: 119, g: 98, b: 169 },
            { r: 214, g: 175, b: 208 },
            { r: 218, g: 57, b: 123 },
            { r: 196, g: 96, b: 98 },
            { r: 218, g: 74, b: 219 },
            { r: 138, g: 100, b: 121 },
            { r: 96, g: 118, b: 225 },
            { r: 132, g: 195, b: 223 },
            { r: 82, g: 127, b: 162 },
            { r: 209, g: 121, b: 211 },
            { r: 181, g: 152, b: 220 },
          ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
          duration: 500,
        },
      },
    },
  },

  init(canvas) {
    this.soundType = false; // false RMS, true ZCR

    this.particles = [];
    this.limit = 1500;
    this.goldenRatio = ((Math.sqrt(5) + 1) / 2) - 1;
    this.goldenAngle = this.goldenRatio * (2 * Math.PI);
    this.circleRadius = (canvas.width * 0.5) - 20;

    this.color = '#fff';

    this.setupPhyllotaxis(canvas);
  },

  resize(canvas) {
    this.particles = [];
    this.limit = 1500;
    this.goldenRatio = ((Math.sqrt(5) + 1) / 2) - 1;
    this.goldenAngle = this.goldenRatio * (2 * Math.PI);
    this.circleRadius = (canvas.width * 0.5) - 20;

    this.setupPhyllotaxis(canvas);
  },

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
  },

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
  },

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
  },
});


/***/ })

});
//# sourceMappingURL=81.bc569c7823849a7f5f2c.js.map