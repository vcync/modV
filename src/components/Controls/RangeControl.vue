<template>
  <RightClickNumberInput
    v-bind="$props"
    v-model="inputValue"
    @input="numberInputHandler"
  >
    <div class="range-control" ref="container">
      <canvas
        @mousedown.left="requestPointerLock"
        @mouseup.left="exitPointerLock"
        ref="canvas"
      ></canvas>
    </div>
  </RightClickNumberInput>
</template>

<script>
import RightClickNumberInput from "../inputs/RightClickNumberInput.vue";
export default {
  components: { RightClickNumberInput },
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
      default: 0.001
    },
    default: Number,
    value: Number
  },

  data() {
    return {
      context: null,
      active: false,
      position: 0,
      inputValue: 0,
      lastCursor: "",
      spacingModifier: 1,
      baseLineHeight: 8,
      modifiedLineHeight: 5,
      inbetweenLineHeight: 12,
      mouseIsDown: false,
      overrideMinMax: false,
      hasOverridenMinMax: false,
      fontFamily: "",
      resizeObserver: null
    };
  },

  computed: {
    spacingScale() {
      const range = this.max - this.min;

      return range > 1 ? 1 : 1 / 1 + range;
    },

    spacingCalc() {
      return (this.spacing * this.spacingScale) / this.spacingModifier;
    }
  },

  created() {
    this.position = -this.value * this.spacingCalc;
    this.inputValue = this.value;
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.$refs.canvas.getContext("2d");

    this.fontFamily = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--sansFont");

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);

    this.resizeObserver = new ResizeObserver(this.resize).observe(
      this.$refs.container
    );
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
  },

  methods: {
    draw() {
      const { devicePixelRatio: dpr } = window;
      const {
        canvas,
        context,
        position,
        spacingCalc,
        value,
        baseLineHeight,
        modifiedLineHeight,
        inbetweenLineHeight,
        fontFamily
      } = this;

      context.fillStyle = "#C4C4C4";
      context.fillRect(0, 0, canvas.width, canvas.height);
      let isExact = false;
      const canvasWidthHalf = canvas.width / 2;

      context.strokeStyle = "#fff";

      let maxIndicators = canvas.width / spacingCalc;
      if (maxIndicators % 2 !== 0) {
        maxIndicators += 1;
      }

      const min = Math.round(value - maxIndicators / 2);
      const max = Math.round(value + maxIndicators / 2);

      for (let i = min; i < max + 1; i += 1) {
        context.strokeStyle = "#fff";
        let heightMod = baseLineHeight;
        if (i % 10 === 0) {
          heightMod = modifiedLineHeight;
        }

        if (i === value) {
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
        context.fillStyle = "#C4C4C4";
        context.fillRect(
          gap - 5 * dpr,
          Math.floor(canvas.height / 2) - 5 * dpr,
          10 * dpr,
          10 * dpr
        );

        context.fillStyle = "#000000";
        context.font = `${12 * dpr}px ${fontFamily}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(i, gap, canvas.height / 1.75 + 0.5);
      }

      if (isExact) {
        context.strokeStyle = "#ff0000";
      }

      context.beginPath();
      context.moveTo(canvasWidthHalf + 0.5, 0);
      context.lineTo(canvasWidthHalf + 0.5, canvas.height + 0.5);
      context.stroke();
    },

    requestPointerLock() {
      const {
        $refs: { canvas }
      } = this;

      document.addEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
      );
      canvas.requestPointerLock();
    },

    exitPointerLock() {
      document.exitPointerLock();
      document.removeEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
      );
    },

    lockChangeAlert() {
      const {
        $refs: { canvas }
      } = this;

      if (document.pointerLockElement === canvas) {
        this.mouseIsDown = true;
        window.addEventListener("mousemove", this.mouseMove, false);
        window.addEventListener("mouseup", this.mouseUp);
      } else {
        document.removeEventListener("mousemove", this.mouseMove, false);
        this.mouseUp();
      }
    },

    mouseUp() {
      this.mouseIsDown = false;

      window.removeEventListener("mousemove", this.mouseMove);
      window.removeEventListener("mouseup", this.mouseUp);
      document.body.style.cursor = this.lastCursor;

      this.spacingModifier = 1;
      this.position = -this.value * this.spacingCalc;
      this.overrideMinMax = false;
      requestAnimationFrame(this.draw);
    },

    mouseMove(e) {
      const { devicePixelRatio: dpr } = window;

      const comp = e.movementX * dpr;

      let newPosition = this.position + comp;

      if (newPosition === this.position) {
        return;
      }

      let value = -newPosition / this.spacingCalc;

      if (
        value < this.min &&
        !this.overrideMinMax &&
        !this.hasOverridenMinMax
      ) {
        newPosition = -this.min * this.spacingCalc;
      }

      if (
        value > this.max &&
        !this.overrideMinMax &&
        !this.hasOverridenMinMax
      ) {
        newPosition = -this.max * this.spacingCalc;
      }

      if (this.hasOverridenMinMax && value < this.max && value > this.min) {
        this.hasOverridenMinMax = false;
      }

      this.position = newPosition;
      value = -newPosition / this.spacingCalc;

      this.$emit("input", value);
      requestAnimationFrame(this.draw);
    },

    input(e) {
      const value = e.target.value;

      if (value < this.min || value > this.max) {
        return false;
      }

      this.position = -value * this.spacingCalc;
      const newValue = -this.position / this.spacingCalc;

      this.$emit("input", newValue);
      requestAnimationFrame(this.draw);
    },

    numberInputHandler() {
      this.$emit("input", this.inputValue);
    },

    keyDown(e) {
      if (!this.mouseIsDown) {
        return;
      }
      e.preventDefault();

      if (e.key === "Shift") {
        this.spacingModifier = 2;
      } else if (e.key === "Alt") {
        this.spacingModifier = 0.5;
      }

      if (e.key === "Control") {
        this.overrideMinMax = true;
        this.hasOverridenMinMax = true;
      }

      this.position = -this.value * this.spacingCalc;
      requestAnimationFrame(this.draw);
    },

    keyUp(e) {
      if (!this.mouseIsDown) {
        return;
      }

      if (e.key === "Shift" || e.key === "Alt") {
        this.spacingModifier = 1;
      }

      if (e.key === "Control") {
        this.overrideMinMax = false;
      }

      this.position = -this.value * this.spacingCalc;
      requestAnimationFrame(this.draw);
    },

    resize(e) {
      const { devicePixelRatio: dpr } = window;
      const { width, height } = e[0].contentRect;
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;

      this.draw();
    }
  },

  watch: {
    value(value) {
      if (value < this.min || value > this.max) {
        return false;
      }

      this.position = -value * this.spacingCalc;
      this.inputValue = value;
      requestAnimationFrame(this.draw);
    },

    min() {
      requestAnimationFrame(this.draw);
    },

    max() {
      requestAnimationFrame(this.draw);
    },

    inputValue(value) {
      this.position = -value * this.spacingCalc;
    }
  }
};
</script>

<style scoped>
canvas {
  border-radius: 23px;
  width: 100%;
}

div {
  position: relative;
  width: 100%;
  height: 16px;
  display: inline-block;
  vertical-align: top;
}
</style>
