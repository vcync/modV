import { Module2D } from '../Modules';

class Ball extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Ball',
        author: '2xAA',
        version: 1.2,
        meyda: ['rms', 'zcr'],
        saveData: {
          soundType: {
            type: 'boolean',
          },
          intensity: {
            type: 'number',
          },
          amount: {
            type: 'number',
          },
          baseSize: {
            type: 'number',
          },
          size: {
            type: 'number',
          },
          colour: {
            type: 'string',
          },
          speed: {
            type: 'number',
          },
          wrap: {
            type: 'boolean',
          },
          balls: {
            type: 'array',
            items: [
              {
                type: 'object',
                properties: {
                  // 'bounds': {
                  //  'type': 'object',
                  //  'properties': {
                  //    'width': {
                  //      'type':'number'
                  //    },
                  //    'height': {
                  //      'type':'number'
                  //    }
                  //  }
                  // },
                  position: {
                    type: 'object',
                    properties: {
                      x: {
                        type: 'number',
                      },
                      y: {
                        type: 'number',
                      },
                    },
                  },
                  velocity: {
                    type: 'object',
                    properties: {
                      x: {
                        type: 'number',
                      },
                      y: {
                        type: 'number',
                      },
                    },
                  },
                  xReverse: {
                    type: 'boolean',
                  },
                  yReverse: {
                    type: 'boolean',
                  },
                },
              },
            ],
          },
        },
      },
    });

    // <
    const controls = [];

    controls.push({
      type: 'checkboxControl',
      variable: 'wrap',
      label: 'Wrap',
      checked: false,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'amount',
      label: 'Amount',
      varType: 'int',
      min: 0,
      max: 50,
      step: 1,
      default: 15,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'speed',
      label: 'Speed',
      varType: 'int',
      min: 1,
      max: 50,
      step: 1,
      default: 5,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'size',
      label: 'Size',
      varType: 'int',
      min: 1,
      max: 50,
      step: 1,
      default: 2,
    });

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
      variable: 'colour',
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

  import(data) {
    Object.keys(data).forEach((key) => {
      const value = data[key];

      switch (key) {
        default:
          this[key] = value;
          break;

        case 'balls': {
          const balls = value;
          this.balls = [];
          for (let i = 0; i < balls.length; i += 1) {
            const ball = balls[i];
            const newBall = new (this.ballObj())();
            newBall.speed = this.speed;
            newBall.bounds.width = this.canvas.width;
            newBall.bounds.height = this.canvas.height;
            newBall.position.x = ball.position.x;
            newBall.position.y = ball.position.y;
            newBall.velocity.x = ball.velocity.x;
            newBall.velocity.y = ball.velocity.y;
            newBall.xReverse = ball.xReverse;
            newBall.yReverse = ball.xReverse;
            this.balls.push(newBall);
          }
          break;
        }
      }
    });
  }

  init(canvas) {
    this.canvas = canvas;
    this.soundType = false; // false RMS, true ZCR
    this.intensity = 15; // Half max
    this.analysed = 0;

    this.amount = 10;
    this.baseSize = 2;
    this.size = 2;
    this.colour = 'pink';
    this.speed = 5;
    this.balls = [];
    this.wrap = false;

    this.setupBalls(canvas);
  }

  resize(canvas) {
    this.setupBalls(canvas);
  }

  draw({ canvas, context, features }) {
    if (this.soundType) {
      this.analysed = (features.zcr / 10) * this.intensity;
    } else {
      this.analysed = (features.rms * 10) * this.intensity;
    }

    for (let i = 0; i < this.amount; i += 1) {
      this.balls[i].speed = this.speed;
      this.balls[i].wrap = this.wrap;
      this.balls[i].drawUpdate(canvas, context, this.analysed, this.colour);
    }
  }

  setupBalls(canvas) {
    this.balls = [];
    for (let i = 0; i < 50; i += 1) {
      const newBall = new (this.ballObj())();
      newBall.speed = this.speed;
      newBall.bounds.width = canvas.width;
      newBall.bounds.height = canvas.height;
      /*eslint-disable */
      newBall.position.x = Math.floor(Math.random() * (newBall.bounds.width - 1 + 1) + 1);
      newBall.position.y = Math.floor(Math.random() * (newBall.bounds.height - 1 + 1) + 1);
      newBall.velocity.x = Math.floor(Math.random() * (10 - 1 + 1) + 1);
      newBall.velocity.y = Math.floor(Math.random() * (10 - 1 + 1) + 1);
      /* eslint-enable */
      newBall.xReverse = Math.round(Math.random());
      newBall.yReverse = Math.round(Math.random());
      this.balls.push(newBall);
    }
  }

  ballObj() {
    const self = this;

    return function ball() {
      this.bounds = { width: 0, height: 0 };
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 5, y: 5 };
      this.wrap = false;
      this.speed = self.speed;

      this.xReverse = false;
      this.yReverse = false;

      this.drawUpdate = function drawUpdate(canvas, ctx, amp, colour) {
        this.bounds.width = canvas.width;
        this.bounds.height = canvas.height;
        ctx.beginPath();
        ctx.fillStyle = colour;
        ctx.arc(
          this.position.x,
          this.position.y,
          self.baseSize + (self.size * amp),
          0,
          2 * Math.PI,
          true,
        );
        ctx.fill();
        ctx.closePath();

        if (this.wrap) {
          if (this.position.x - self.baseSize < 1) {
            this.position.x = (this.bounds.width - 1) - self.baseSize;
          }
          if (this.position.y - self.baseSize < 1) {
            this.position.y = (this.bounds.height - 1) - self.baseSize;
          }

          if (this.position.x + self.baseSize > this.bounds.width - 1) {
            this.position.x = self.baseSize + 1;
          }
          if (this.position.y + self.baseSize > this.bounds.height - 1) {
            this.position.y = self.baseSize + 1;
          }
        } else {
          if (
            this.position.x - self.baseSize < 1 ||
            this.position.x + self.baseSize > this.bounds.width - 1
          ) {
            this.xReverse = !this.xReverse;
          }

          if (
            this.position.y - self.baseSize < 1 ||
            this.position.y + self.baseSize > this.bounds.height - 1
          ) {
            this.yReverse = !this.yReverse;
          }
        }

        if (this.xReverse) this.velocity.x = -this.speed;
        else this.velocity.x = this.speed;

        if (this.yReverse) this.velocity.y = -this.speed;
        else this.velocity.y = this.speed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.velocity.y === 0) this.velocity.y = -this.velocity.y + 1;
      };

      this.setBounds = function setBounds(width, height) {
        this.bounds = {
          width,
          height,
        };

        if (this.position.x > this.bounds.width) this.position.x = this.bounds.width - 1;
        if (this.position.y > this.bounds.height) this.position.y = this.bounds.height - 1;
      };
    };
  }
}

export default Ball;
