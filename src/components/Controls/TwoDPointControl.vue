<template>
  <div class="2d-point-control" :data-moduleName="moduleName">
    <b-field :label="label" :addons="false">
      <div style="display: inline-block">
        <div style="display: inline-block">
          <canvas
            ref="pad"
            class="pad"
            width="170"
            height="170"
            @click="click"
            @mousedown="mouseDown"
            @touchstart="touchStart"
          ></canvas>
        </div>
        <div style="display: inline-block; vertical-align: bottom">
          <b-field label="X:" :addons="false">
            <b-input
              v-model.number="currentX"
              class="pure-form-message-inline"
              type="number"
              step="0.01"
              @input="xInput"
            ></b-input>
          </b-field>
          <b-field label="Y:" :addons="false">
            <b-input
              v-model.number="currentY"
              class="pure-form-message-inline"
              type="number"
              step="0.01"
              @input="yInput"
            ></b-input>
          </b-field>
        </div>
      </div>
    </b-field>
  </div>
</template>

<script>
export default {
  name: 'TwoDPointControl',
  data() {
    return {
      context: null,
      mousePressed: false,
      canvasCoords: [65.5, 65.5],
      currentX: 0,
      currentY: 0,
      inputX: 0,
      inputY: 0
    }
  },
  computed: {
    min() {
      let min = isNaN(this.meta.min) ? -1.0 : this.meta.min
      min = Array.isArray(this.meta.min) ? this.meta.min[0] : min
      return min
    },
    max() {
      let max = isNaN(this.meta.max) ? 1.0 : this.meta.max
      max = Array.isArray(this.meta.max) ? this.meta.max[0] : max
      return max
    },
    step() {
      return this.meta.step || 0.01
    }
  },
  watch: {
    value() {
      this.currentX = this.value[0]
      this.currentY = this.value[1]
    },
    canvasCoords() {
      this.draw(this.canvasCoords[0], this.canvasCoords[1])
    }
  },
  mounted() {
    this.$refs.pad.width = 170
    this.$refs.pad.height = 170
    this.context = this.$refs.pad.getContext('2d')
    this.canvasCoords = this.unmapValues(this.value[0], this.value[1])
    this.currentX = this.value[0]
    this.currentY = this.value[1]
  },
  methods: {
    mapValues(x, y) {
      const mappedX = Math.map(x, 0, 170, this.min, this.max)
      const mappedY = Math.map(y, 170, 0, this.min, this.max)
      return [+mappedX.toFixed(2), +mappedY.toFixed(2)]
    },
    unmapValues(x, y) {
      const unmappedX = Math.map(x, this.min, this.max, 0, 170)
      const unmappedY = Math.map(y, this.min, this.max, 170, 0)
      return [unmappedX, unmappedY]
    },
    mouseDown() {
      this.mousePressed = true
      window.addEventListener('mousemove', this.mouseMove.bind(this))
      window.addEventListener('mouseup', this.mouseUp.bind(this))
      window.addEventListener('touchmove', this.touchMove.bind(this))
      window.addEventListener('touchEnd', this.touchEnd.bind(this))
    },
    mouseUp() {
      this.mousePressed = false
      window.removeEventListener('mousemove', this.mouseMove.bind(this))
      window.removeEventListener('mouseup', this.mouseUp.bind(this))
      window.removeEventListener('touchmove', this.touchMove.bind(this))
      window.removeEventListener('touchEnd', this.touchEnd.bind(this))
    },
    mouseMove(e) {
      if (!this.mousePressed) return
      this.calculateValues(e)
    },
    touchStart() {
      this.mousePressed = true
    },
    touchMove(e) {
      if (!this.mousePressed) return
      this.calculateValues(e)
    },
    touchEnd() {
      this.mousePressed = false
    },
    click(e) {
      this.calculateValues(e, true)
    },
    calculateValues(e, clicked = false) {
      const rect = this.$refs.pad.getBoundingClientRect()

      let clientX

      if ('clientX' in e) {
        clientX = e.clientX
      } else {
        e.preventDefault()
        clientX = e.targetTouches[0].clientX
      }

      let clientY

      if ('clientY' in e) {
        clientY = e.clientY
      } else {
        clientY = e.targetTouches[0].clientY
      }

      const x = clientX - Math.round(rect.left)
      const y = clientY - Math.round(rect.top)

      if (this.mousePressed || clicked) {
        this.value = this.mapValues(x, y)
        this.canvasCoords = [x, y]
        this.currentX = this.value[0]
        this.currentY = this.value[1]
      }
    },
    draw(x, y) {
      const canvas = this.$refs.pad
      const context = this.context

      context.fillStyle = '#393939'
      context.fillRect(0, 0, canvas.width, canvas.height)

      this.drawGrid()
      this.drawPosition(Math.round(x) + 0.5, Math.round(y) + 0.5)
    },
    drawGrid() {
      const canvas = this.$refs.pad
      const context = this.context
      const { width, height } = canvas

      context.save()
      context.strokeStyle = '#aaa'
      context.beginPath()
      context.lineWidth = 1
      const sections = 16
      const step = width / sections
      for (let i = 1; i < sections; i += 1) {
        context.moveTo(Math.round(i * step) + 0.5, 0)
        context.lineTo(Math.round(i * step) + 0.5, height)
        context.moveTo(0, Math.round(i * step) + 0.5)
        context.lineTo(width, Math.round(i * step) + 0.5)
      }
      context.stroke()
      context.restore()
    },
    drawPosition(x, y) {
      const canvas = this.$refs.pad
      const context = this.context
      const { width, height } = canvas
      context.lineWidth = 1
      context.strokeStyle = '#ffa600'

      if (x < Math.round(width / 2)) context.strokeStyle = '#005aff'

      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, canvas.height)
      context.stroke()

      if (y <= Math.round((height + 1) / 2)) context.strokeStyle = '#ffa600'
      else context.strokeStyle = '#005aff'

      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()

      if (x < Math.round(width / 2) && y > Math.round(height / 2)) {
        context.strokeStyle = '#005aff'
      } else {
        context.strokeStyle = '#ffa600'
      }

      context.beginPath()
      context.arc(x, y, 6, 0, 2 * Math.PI, true)
      context.stroke()
    },
    xInput(value) {
      this.inputX = parseFloat(value)
      this.value = [value, this.inputY]
      this.canvasCoords = this.unmapValues(value, this.inputY)
    },
    yInput(value) {
      this.inputY = parseFloat(value)
      this.value = [this.inputX, value]
      this.canvasCoords = this.unmapValues(this.inputX, value)
    }
  }
}
</script>

<style scoped lang="scss">
input.pure-form-message-inline {
  max-width: 70px;
}

.pad {
  width: 170px;
  height: 170px;
  // border: 1px solid #000;
  position: relative;
  background-color: #fff;
  cursor: crosshair;
}

.point {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: #000;
  position: absolute;
  will-change: transform;
  transform: translateX(0px) translateY(0px);
}
</style>
