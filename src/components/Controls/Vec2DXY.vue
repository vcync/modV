<template>
  <div class="2d-point-control">
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
</template>

<script>
export default {
  props: {
    value: {
      default: () => [],
      required: true
    },

    min: {
      default: -1
    },
    max: {
      default: 1
    },
    step: {
      type: Number,
      default: 0.01
    }
  },
  data() {
    return {
      context: null,
      mousePressed: false,
      currentX: 0,
      currentY: 0,
      inputX: 0,
      inputY: 0
    };
  },
  computed: {
    minCalc() {
      let min = isNaN(this.min) ? -1.0 : this.min;
      min = Array.isArray(this.min) ? this.min[0] : min;
      return min;
    },
    maxCalc() {
      let max = isNaN(this.max) ? 1.0 : this.max;
      max = Array.isArray(this.max) ? this.max[0] : max;
      return max;
    },
    canvasCoords() {
      return [
        (this.currentX / 2 + 0.5) * this.$refs.pad.width,
        (1 - (this.currentY / 2 + 0.5)) * this.$refs.pad.height
      ];
    }
  },
  watch: {
    value() {
      this.currentX = this.value[0];
      this.currentY = this.value[1];
      requestAnimationFrame(this.draw);
    }
  },
  mounted() {
    this.$refs.pad.width = 170;
    this.$refs.pad.height = 170;
    this.context = this.$refs.pad.getContext("2d");
    this.currentX = this.value[0];
    this.currentY = this.value[1];
    requestAnimationFrame(this.draw);
  },
  methods: {
    mouseDown() {
      this.mousePressed = true;
      window.addEventListener("mousemove", this.mouseMove);
      window.addEventListener("mouseup", this.mouseUp);
      window.addEventListener("touchmove", this.touchMove);
      window.addEventListener("touchEnd", this.touchEnd);
    },
    mouseUp() {
      this.mousePressed = false;
      window.removeEventListener("mousemove", this.mouseMove);
      window.removeEventListener("mouseup", this.mouseUp);
      window.removeEventListener("touchmove", this.touchMove);
      window.removeEventListener("touchEnd", this.touchEnd);
    },
    mouseMove(e) {
      if (!this.mousePressed) {
        return;
      }
      this.calculateValues(e);
    },
    touchStart() {
      this.mousePressed = true;
    },
    touchMove(e) {
      if (!this.mousePressed) {
        return;
      }
      this.calculateValues(e);
    },
    touchEnd() {
      this.mousePressed = false;
    },
    click(e) {
      this.calculateValues(e, true);
    },
    calculateValues(e, clicked = false) {
      const rect = this.$refs.pad.getBoundingClientRect();

      let clientX;

      if ("clientX" in e) {
        clientX = e.clientX;
      } else {
        e.preventDefault();
        clientX = e.targetTouches[0].clientX;
      }

      let clientY;

      if ("clientY" in e) {
        clientY = e.clientY;
      } else {
        clientY = e.targetTouches[0].clientY;
      }

      const x = clientX - Math.round(rect.left);
      const y = clientY - Math.round(rect.top);

      if (this.mousePressed || clicked) {
        const vals = this.mapValues(x, y);
        this.$emit("input", vals);
        this.currentX = vals[0];
        this.currentY = vals[1];
      }
      requestAnimationFrame(this.draw);
    },

    mapValues(x, y) {
      const xOut = 1 + (x / this.$refs.pad.width - 1) * 2;
      const yOut = -(1 + (y / this.$refs.pad.height - 1) * 2);
      return [xOut, yOut];
    },

    draw() {
      const canvas = this.$refs.pad;
      const context = this.context;
      const x = this.canvasCoords[0];
      const y = this.canvasCoords[1];

      context.fillStyle = "#393939";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#fff";
      this.drawGrid();
      context.fillText(`x: ${this.currentX}`, 5, 10);
      context.fillText(`y: ${this.currentY}`, 5, 20);
      this.drawPosition(Math.round(x) + 0.5, Math.round(y) + 0.5);
    },

    drawGrid() {
      const canvas = this.$refs.pad;
      const context = this.context;
      const { width, height } = canvas;

      context.save();
      context.strokeStyle = "#2c2c2c";
      context.beginPath();
      context.lineWidth = 1;
      const sections = 16;
      const step = width / sections;
      for (let i = 1; i < sections; i += 1) {
        const pos = Math.round(i * step) + 0.5;
        context.moveTo(pos, 0);
        context.lineTo(pos, height);
        context.moveTo(0, pos);
        context.lineTo(width, pos);
      }
      context.stroke();
      context.beginPath();

      context.strokeStyle = "#6c6c6c";
      const halfWidth = Math.round(width / 2) + 0.5;
      const halfHeight = Math.round(height / 2) + 0.5;
      context.moveTo(halfWidth, 0);
      context.lineTo(halfHeight, height);
      context.moveTo(0, halfHeight);
      context.lineTo(width, halfHeight);
      context.stroke();

      context.restore();
    },

    drawPosition(x, y) {
      const canvas = this.$refs.pad;
      const context = this.context;
      const { width, height } = canvas;
      context.lineWidth = 1;
      context.strokeStyle = "#ffa600";

      if (x < Math.round(width / 2)) {
        context.strokeStyle = "#005aff";
      }

      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();

      if (y <= Math.round((height + 1) / 2)) {
        context.strokeStyle = "#ffa600";
      } else {
        context.strokeStyle = "#005aff";
      }

      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();

      if (x < Math.round(width / 2) && y > Math.round(height / 2)) {
        context.strokeStyle = "#005aff";
      } else {
        context.strokeStyle = "#ffa600";
      }

      context.beginPath();
      context.arc(x, y, 6, 0, 2 * Math.PI, true);
      context.stroke();
    }
  }
};
</script>

<style>
.pad {
  width: 170px;
  height: 170px;
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
