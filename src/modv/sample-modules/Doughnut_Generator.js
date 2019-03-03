export default {
  meta: {
    name: 'Doughnut Generator',
    author: '2xAA',
    type: '2d',
    version: '1.0.0'
  },

  presets: {
    one: {
      props: {
        multiplier: 6.4,
        shape: 'line-joined'
      }
    },
    two: {
      props: {
        multiplier: 6.9,
        points: 169,
        shape: 'line-joined'
      }
    },
    three: {
      props: {
        multiplier: 7.3,
        points: 169,
        shape: 'line-joined'
      }
    }
  },

  props: {
    posX: {
      label: 'X Offset',
      type: 'float',
      min: 0,
      max: 500,
      default: 160
    },

    posY: {
      label: 'Y Offset',
      type: 'float',
      min: 0,
      max: 500,
      default: 40
    },

    spread: {
      label: 'Spread',
      type: 'float',
      min: 0,
      max: 150,
      default: 50
    },

    points: {
      label: 'No. Points',
      type: 'int',
      min: 0,
      max: 2000,
      abs: true,
      default: 1000
    },

    multiplier: {
      label: 'Multiplier',
      type: 'float',
      min: 1,
      max: 10,
      default: 3
    },

    size: {
      label: 'Size',
      type: 'float',
      min: 1,
      max: 5,
      abs: true,
      default: 1
    },

    speed: {
      label: 'Speed',
      type: 'float',
      min: 0,
      max: 10000,
      abs: true,
      default: 1000
    },

    // color: {
    //   type: 'color',
    //   returnType: 'hsva',
    //   default: { h: 127, s: 1, v: 1, a: 1 },
    // },

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
            { r: 181, g: 152, b: 220 }
          ], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
          duration: 500
        }
      }
    },

    shape: {
      type: 'enum',
      enum: [
        { label: 'Rectangle', value: 'rectangle' },
        { label: 'Point', value: 'point' },
        { label: 'Line', value: 'line' },
        { label: 'Line Joined', value: 'line-joined' }
      ],
      default: 'point'
    }

    // gui.add(ring, 'hueRotate');
    // gui.add(ring, 'hueRotateSpeed', 0, 0.01);
  },

  data: {
    // hueRotate: false,
    // hueRotateSpeed: 0.002,
    // hueRotationValue: 0,
  },

  // get colorString() {
  //   if (!this.color) {
  //     return 'hsla(0, 100%, 100%, 1)';
  //   }

  //   const { s, v, a } = this.color;
  //   let h = this.color.h;

  //   if (this.hueRotate) {
  //     this.hueRotationValue += this.hueRotateSpeed;
  //     h += this.hueRotationValue;
  //   }

  //   const hsl = hsvToHsl(h, s, v);
  //   return `hsla(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%, ${a})`;
  // },

  draw({ canvas, context, delta }) {
    const dpr = window.devicePixelRatio
    const { width, height } = canvas
    const { points, size, speed, spread, posX, posY, multiplier } = this

    if (this.shape === 'line-joined') {
      context.beginPath()
    }

    for (let i = 0; i < points; i += 1) {
      context.fillStyle = this.color
      context.strokeStyle = this.color
      context.lineWidth = this.size * dpr

      const x = (width / 2) - spread * dpr * - Math.sin(((i / points) * 360) * Math.PI / 180) + -(Math.cos(delta * 2 / speed + (i * multiplier)) * dpr * posX); //eslint-disable-line
      const y = (height / 2) - spread * dpr * - Math.cos(((i / points) * 360) * Math.PI / 180) + -(Math.sin(delta * 2 / speed - (i * multiplier)) * dpr * posY); //eslint-disable-line

      switch (this.shape) {
        case 'rectangle':
          context.fillRect(x, y, size * dpr, size * dpr)
          break

        case 'point':
          context.beginPath()
          context.arc(x, y, size * dpr, 0, 2 * Math.PI)
          context.fill()
          break

        case 'line':
          if (i % 2 === 0) {
            context.beginPath()
            context.moveTo(x, y)
          } else {
            context.lineTo(x, y)
            context.closePath()
            context.stroke()
          }
          break

        case 'line-joined':
          if (i === 0) {
            context.moveTo(x, y)
          } else {
            context.lineTo(x, y)
          }
          break
        default:
          break
      }
    }

    if (this.shape === 'line-joined') {
      context.stroke()
    }
  }
}
