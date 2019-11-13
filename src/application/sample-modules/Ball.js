// import Meyda from 'meyda';

export default {
  meta: {
    name: "Ball",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["zcr", "rms"],
    type: "2d"
  },

  props: {
    amount: {
      label: "Amount",
      type: "int",
      min: 1,
      max: 300,
      default: 10,
      // default: [1, 10, 20],
      // random: true,
      strict: true
    },

    speed: {
      label: "Speed",
      type: "float",
      min: 0,
      max: 20,
      step: 0.01,
      default: 2
    },

    wrap: {
      label: "Wrap",
      type: "bool",
      default: false
    },

    size: {
      label: "Size",
      type: "int",
      min: 1,
      max: 50,
      step: 1,
      default: 2,
      abs: true
    },

    intensity: {
      label: "RMS/ZCR Intensity",
      type: "int",
      min: 0,
      max: 30,
      step: 1,
      default: 15,
      abs: true
    },

    soundType: {
      label: "RMS (unchecked) / ZCR (checked)",
      type: "bool",
      default: false
    },

    // color: {
    //   default: { r: 255, g: 104, b: 163, a: 1 },
    //   // explicitly define a control
    //   control: {
    //     type: "paletteControl",

    //     // pass options to the control
    //     options: {
    //       returnFormat: "rgbaString",
    //       colors: [
    //         { r: 255, g: 255, b: 255, a: 1 },
    //         { r: 0, g: 0, b: 0, a: 1 },
    //         { r: 255, g: 0, b: 0, a: 0.5 }
    //       ],
    //       duration: 1000
    //     }
    //   }
    // }

    color: {
      type: "tween",
      component: "PaletteControl",
      default: {
        data: [[0, 0, 0], [255, 255, 255]],
        duration: 10000,
        easing: "linear"
      }
    }
  },

  data: {
    soundType: false, // false RMS, true ZCR
    intensity: 1, // Half max
    analysed: 0,
    baseSize: 1,
    size: 2,
    color: [255, 0, 0, 1],
    speed: 1,
    balls: []
  },

  init({ data, canvas }) {
    data.balls = this.setupBalls(canvas);
    return data;
  },

  resize({ data, canvas }) {
    data.balls = this.setupBalls(canvas);
    return data;
  },

  update({ data, props, canvas }) {
    const { amount, speed, wrap } = props;

    for (let i = 0; i < amount; i += 1) {
      this.updateBall({
        ball: data.balls[i],
        speed,
        wrap,
        canvas,
        radius: props.size
      });
    }

    return data;
  },

  draw({ data, props, context, features }) {
    let analysed;

    if (props.soundType) {
      analysed = (features.zcr / 10) * props.intensity;
    } else {
      analysed = features.rms * 10 * props.intensity;
    }

    const color = props.color.value;
    for (let i = 0; i < props.amount; i += 1) {
      this.drawBall({ ball: data.balls[i], color, context, analysed });
    }
  },

  setupBalls(canvas) {
    const balls = [];
    for (let i = 0; i < 300; i += 1) {
      const ball = this.ballFactory({
        positionX: Math.floor(Math.random() * canvas.width + 1),
        positionY: Math.floor(Math.random() * canvas.height + 1)
      });

      balls.push(ball);
    }

    return balls;
  },

  ballFactory({ positionX, positionY, speed = 0, radius = 0 }) {
    return {
      radius,
      speed,
      position: { x: positionX, y: positionY },
      direction: { x: false, y: false }
    };
  },

  updateBall({ canvas, ball, speed, radius }) {
    const {
      position: { x, y },
      direction: { x: directionX, y: directionY }
    } = ball;

    ball.radius = radius;

    let dx = speed;
    let dy = speed;

    if (directionX) {
      dx = -dx;
    }

    if (directionY) {
      dy = -dy;
    }

    if (x + dx > canvas.width - radius || x + dx < radius) {
      ball.direction.x = !ball.direction.x;
    }
    if (y + dy > canvas.height - radius || y + dy < radius) {
      ball.direction.y = !ball.direction.y;
    }

    ball.position.x += dx;
    ball.position.y += dy;

    return ball;
  },

  drawBall({ ball, color, context, analysed }) {
    context.beginPath();
    context.fillStyle = `rgb(${Math.round(color[0])},${Math.round(
      color[1]
    )},${Math.round(color[2])})`;
    context.arc(
      ball.position.x,
      ball.position.y,
      Math.round(ball.radius * analysed),
      0,
      2 * Math.PI,
      true
    );
    context.fill();
    context.closePath();
  }
};
