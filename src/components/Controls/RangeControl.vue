<template>
  <div ref="container">
    <canvas
      ref="canvas"
      @mousedown="mouseDown"
      @dblclick="toggleEditMode()"
    ></canvas>
    <input
      v-model="inputValue"
      type="number"
      step="0.01"
      v-show="editMode"
      @input="input"
      @keypress.enter="editMode = false"
      ref="input"
    />
  </div>
</template>

<script>
import fontFamily from "../../util/font-family";

export default {
  props: {
    min: {
      type: Number,
      default: -1
    },
    max: {
      type: Number,
      default: 1
    },
    spacing: {
      type: Number,
      default: 40
    },
    step: {
      type: Number,
      default: 2
    },
    type: {
      type: String,
      validator: val => ["int", "float"].includes(val),
      default: "float"
    },
    default: Number,
    value: Number
  },

  data() {
    return {
      context: null,
      active: false,
      startX: 0,
      position: 0,
      actualPosition: 0,
      lastComp: 0,
      internalValue: 0,
      editMode: false,
      inputValue: 0,
      lastCursor: "",
      spacingModifier: 1,
      baseLineHeight: 8,
      modifiedLineHeight: 5,
      inbetweenLineHeight: 12,
      resizeObserver: null
    };
  },

  computed: {
    spacingCalc() {
      const { devicePixelRatio: dpr } = window;
      return (this.spacing * dpr) / this.spacingModifier;
    }
  },

  created() {
    this.position = -this.value * this.spacingCalc;
    this.internalValue = this.value;
  },

  mounted() {
    const { devicePixelRatio: dpr } = window;
    this.canvas = this.$refs.canvas;
    this.context = this.$refs.canvas.getContext("2d");
    this.canvas.width = 200 * dpr;
    this.canvas.height = 20 * dpr;

    this.context.fillStyle = "#333";
    this.context.strokeStyle = "#fff";
    requestAnimationFrame(this.draw);

    this.actualPosition = -this.value * this.spacingCalc;

    this.resizeObserver = new ResizeObserver(this.resize).observe(
      this.$refs.container
    );
  },

  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },

  methods: {
    draw() {
      const { devicePixelRatio: dpr } = window;
      const {
        canvas,
        context,
        position,
        spacingCalc,
        internalValue,
        baseLineHeight,
        modifiedLineHeight,
        inbetweenLineHeight
      } = this;
      context.fillStyle = "#333";
      context.fillRect(0, 0, canvas.width, canvas.height);
      let isExact = false;
      const canvasWidthHalf = canvas.width / 2;

      context.strokeStyle = "#fff";
      context.lineWidth = 1 * dpr;

      let maxIndicators = canvas.width / spacingCalc;
      if (maxIndicators % 2 !== 0) {
        maxIndicators += 1;
      }

      const min = Math.round(internalValue - maxIndicators / 2);
      const max = Math.round(internalValue + maxIndicators / 2);

      for (let i = min; i < max + 1; i += 1) {
        context.strokeStyle = "#fff";
        let heightMod = baseLineHeight;
        if (i % 10 === 0) {
          heightMod = modifiedLineHeight;
        }

        if (i === internalValue) {
          isExact = true;
        }

        const gap = canvasWidthHalf + position + i * spacingCalc + 0.5;

        context.beginPath();
        context.moveTo(gap, heightMod);
        context.lineTo(gap, canvas.height - heightMod);
        context.stroke();

        const inbetweenGap = spacingCalc / 6;

        for (let j = 1; j < 6; j += 1) {
          context.strokeStyle = "#777";
          context.beginPath();
          context.moveTo(
            Math.floor(gap + j * inbetweenGap) + 0.5,
            inbetweenLineHeight
          );
          context.lineTo(
            Math.floor(gap + j * inbetweenGap) + 0.5,
            canvas.height - inbetweenLineHeight
          );
          context.stroke();
        }

        context.fillStyle = "#333";
        context.fillRect(
          gap - 5 * dpr,
          Math.floor(canvas.height / 2) - 5 * dpr,
          10 * dpr,
          10 * dpr
        );

        context.font = `${12 * dpr}px ${fontFamily}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#fff";
        context.fillText(i, gap, Math.floor(canvas.height / 2));
      }

      if (isExact) {
        context.strokeStyle = "#ff0000";
      }

      context.beginPath();
      context.moveTo(canvasWidthHalf + 0.5, 0);
      context.lineTo(canvasWidthHalf + 0.5, canvas.height + 0.5);
      context.stroke();
    },

    mouseDown(e) {
      this.startX = e.clientX;

      window.addEventListener("mousemove", this.mouseMove);
      window.addEventListener("mouseup", this.mouseUp);
      window.addEventListener("keydown", this.keyDown);
      window.addEventListener("keyup", this.keyUp);
      this.lastCursor = document.body.style.cursor;
      document.body.style.cursor = "ew-resize";
    },

    mouseUp() {
      this.lastComp = 0;
      window.removeEventListener("mousemove", this.mouseMove);
      window.removeEventListener("mouseup", this.mouseUp);
      window.removeEventListener("keydown", this.keyDown);
      window.removeEventListener("keyup", this.keyUp);
      document.body.style.cursor =
        this.lastCursor === "ew-resize" ? "default" : this.lastCursor;
    },

    mouseMove(e) {
      const { devicePixelRatio: dpr } = window;
      const {
        type,
        actualPosition,
        lastComp,
        startX,
        spacingCalc,
        min,
        max
      } = this;

      const comp = e.clientX * dpr - startX * dpr;

      let newPosition = actualPosition + (comp - lastComp);

      if (newPosition === actualPosition) {
        return;
      }

      let value = -newPosition / spacingCalc;
      this.lastComp = comp;

      if (value < this.min) {
        newPosition = -min * spacingCalc;
      }

      if (value > this.max) {
        newPosition = -max * spacingCalc;
      }

      value = -newPosition / this.spacingCalc;

      this.actualPosition = newPosition;

      if (type === "int") {
        const rounded = Math.round(value);

        if (rounded === this.internalValue) {
          return;
        } else {
          this.position = rounded * spacingCalc;
          this.internalValue = rounded;

          requestAnimationFrame(this.draw);
        }
      } else {
        this.internalValue = value;
        this.position = this.actualPosition;
        requestAnimationFrame(this.draw);
      }

      this.$emit("input", this.internalValue);
      this.inputValue = this.internalValue;
    },

    input(e) {
      const value = e.target.value;

      if (value < this.min || value > this.max) {
        return false;
      }

      this.position = -value * this.spacingCalc;
      this.internalValue = -this.position / this.spacingCalc;
      this.$emit("input", this.internalValue);
      requestAnimationFrame(this.draw);
    },

    toggleEditMode() {
      this.editMode = !this.editMode;

      if (this.editMode) {
        this.$refs.input.focus();
      }

      return false;
    },

    keyDown(e) {
      if (e.key === "Shift") {
        this.spacingModifier = 2;
      } else if (e.key === "Alt") {
        this.spacingModifier = 0.5;
      }
    },

    keyUp(e) {
      if (e.key === "Shift" || e.key === "Alt") {
        this.spacingModifier = 1;
      }
    },

    resize(e) {
      const { devicePixelRatio: dpr } = window;
      const { width, height } = e[0].contentRect;
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;

      requestAnimationFrame(this.draw);
    }
  },

  watch: {
    value(value) {
      if (value < this.min || value > this.max) {
        return false;
      }

      this.position = -value * this.spacingCalc;
      this.internalValue = value;
      this.inputValue = value;
      requestAnimationFrame(this.draw);
    }
  }
};
</script>

<style scoped>
div {
  position: relative;
  width: 100%;
  min-width: 200px;
  display: inline-block;
}

canvas {
  height: 20px;
  width: 100%;
}

input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
