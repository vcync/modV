// import Meyda from 'meyda';

export default {
  meta: {
    name: 'Ball',
    author: '2xAA',
    version: '1.0.0',
    audioFeatures: ['zcr', 'rms'],
    type: '2d'
  },

  props: {
    amount: {
      label: 'Amount',
      type: 'int',
      min: 1,
      max: 300,
      default: [1, 10, 20],
      random: true,
      strict: true
    },

    speed: {
      label: 'Speed',
      type: 'float',
      min: 0,
      max: 20,
      step: 0.01,
      default: 2
    },

    wrap: {
      label: 'Wrap',
      type: 'bool',
      default: false
    },

    size: {
      label: 'Size',
      type: 'int',
      min: 1,
      max: 50,
      step: 1,
      default: 2,
      abs: true
    },

    intensity: {
      label: 'RMS/ZCR Intensity',
      type: 'int',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
      abs: true
    },

    soundType: {
      label: 'RMS (unchecked) / ZCR (checked)',
      type: 'bool',
      default: false
    },

    color: {
      default: { r: 255, g: 104, b: 163, a: 1 },
      // explicitly define a control
      control: {
        type: 'paletteControl',

        // pass options to the control
        options: {
          returnFormat: 'rgbaString',
          colors: [
            { r: 255, g: 255, b: 255, a: 1 },
            { r: 0, g: 0, b: 0, a: 1 },
            { r: 255, g: 0, b: 0, a: 0.5 }
          ],
          duration: 1000
        }
      }
    }
  },

  data: {
    soundType: false, // false RMS, true ZCR
    intensity: 1, // Half max
    analysed: 0,
    amount: 10,
    baseSize: 1,
    size: 2,
    color: [255, 0, 0, 1],
    speed: 1,
    balls: [],
    wrap: false
  },

  init({ canvas }) {
    this.setupBalls(canvas)
  },

  resize({ canvas }) {
    this.setupBalls(canvas)
  },

  draw({ canvas, context, features }) {
    if (this.soundType) {
      this.analysed = (features.zcr / 10) * this.intensity
    } else {
      this.analysed = features.rms * 10 * this.intensity
    }

    for (let i = 0; i < this.amount; i += 1) {
      this.balls[i].speed = this.speed
      this.balls[i].wrap = this.wrap
      this.balls[i].drawUpdate(canvas, context, this.analysed, this.color)
    }
  },

  setupBalls(canvas) {
    this.balls = []
    for (let i = 0; i < 300; i += 1) {
      const newBall = new (this.ballObj())()
      newBall.speed = this.speed
      newBall.bounds.width = canvas.width
      newBall.bounds.height = canvas.height
      /*eslint-disable */
      newBall.position.x = Math.floor(Math.random() * (newBall.bounds.width - 1 + 1) + 1);
      newBall.position.y = Math.floor(Math.random() * (newBall.bounds.height - 1 + 1) + 1);
      newBall.velocity.x = Math.floor(Math.random() * (10 - 1 + 1) + 1);
      newBall.velocity.y = Math.floor(Math.random() * (10 - 1 + 1) + 1);
      /* eslint-enable */
      newBall.xReverse = Math.round(Math.random())
      newBall.yReverse = Math.round(Math.random())
      this.balls.push(newBall)
    }
  },

  ballObj() {
    const self = this

    return function ball() {
      this.bounds = { width: 0, height: 0 }
      this.position = { x: 0, y: 0 }
      this.velocity = { x: 5, y: 5 }
      this.wrap = false
      this.speed = self.speed

      this.xReverse = false
      this.yReverse = false

      this.drawUpdate = function drawUpdate(canvas, ctx, amp, colour) {
        this.bounds.width = canvas.width
        this.bounds.height = canvas.height

        const ballRadius = self.size

        ctx.beginPath()
        ctx.fillStyle = colour
        ctx.arc(
          this.position.x,
          this.position.y,
          ballRadius + self.size * amp,
          0,
          2 * Math.PI,
          true
        )
        ctx.fill()
        ctx.closePath()

        const x = this.position.x
        const y = this.position.y
        const dx = this.velocity.x
        const dy = this.velocity.y

        if (this.wrap) {
          if (this.position.x - ballRadius < 1) {
            this.position.x = this.bounds.width - 1 - ballRadius
          }
          if (this.position.y - ballRadius < 1) {
            this.position.y = this.bounds.height - 1 - ballRadius
          }

          if (this.position.x + ballRadius > this.bounds.width - 1) {
            this.position.x = ballRadius + 1
          }
          if (this.position.y + ballRadius > this.bounds.height - 1) {
            this.position.y = ballRadius + 1
          }
        } else {
          if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            this.xReverse = !this.xReverse
          }
          if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
            this.yReverse = !this.yReverse
          }
        }

        if (this.xReverse) this.velocity.x = -this.speed
        else this.velocity.x = this.speed

        if (this.yReverse) this.velocity.y = -this.speed
        else this.velocity.y = this.speed

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.velocity.y === 0) this.velocity.y = -this.velocity.y + 1
      }

      this.setBounds = function setBounds(width, height) {
        this.bounds = {
          width,
          height
        }

        if (this.position.x > this.bounds.width)
          this.position.x = this.bounds.width - 1
        if (this.position.y > this.bounds.height)
          this.position.y = this.bounds.height - 1
      }
    }
  }
}
