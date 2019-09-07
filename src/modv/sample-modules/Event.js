class Latch {
  constructor(callback, initialValue) {
    this.active = false
    this.lastValue = initialValue

    this.update = (variable, ...args) => {
      if (variable && !this.active) {
        this.active = true
        // eslint-disable-next-line
        this.lastValue = callback(...args)
      } else if (!variable && this.active) {
        this.active = false
      }

      return this.lastValue
    }
  }
}

let index = 0

function increment(maxIndex) {
  index++

  if (index > maxIndex) {
    index = 0
  }

  return index
}

export default {
  meta: {
    name: 'Event',
    type: '2d'
  },

  props: {
    event: {
      type: 'button'
    },

    latch: {
      type: 'bool'
    },

    text: {
      type: 'string',
      default:
        'ten,nine,eight,seven,six,five,four,three,two,one,we have liftoff!',
      set(value) {
        this.textArray = value.split(',')
      }
    },

    color: {
      type: 'color',
      default: '#ff0000',
      options: {
        returnFormat: 'hexString'
      }
    }
  },

  data: {
    index: 0
  },

  init() {
    this.latchHelper = new Latch(increment, this.index)
    this.textArray = this.text.split(',')
  },

  draw({ context, canvas }) {
    if (this.latch) {
      this.index = this.latchHelper.update(
        this.event,
        this.textArray.length - 1
      )
    } else if (!this.latch && this.event) {
      this.index = increment(this.textArray.length - 1)
    }

    context.font = '32px sans-serif'
    context.fillStyle = this.color
    context.fillText(this.textArray[this.index], 0, canvas.height / 2)
  }
}
