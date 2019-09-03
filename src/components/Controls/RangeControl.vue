<template>
  <div>
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
    default: Number,
    value: Number
  },

  data() {
    return {
      context: null,
      active: false,
      startX: 0,
      position: 0,
      lastComp: 0,
      internalValue: 0,
      editMode: false,
      inputValue: 0,
      lastCursor: "",
      spacingModifier: 1,
      baseLineHeight: 8,
      modifiedLineHeight: 5,
      inbetweenLineHeight: 12
    };
  },

  computed: {
    spacingCalc() {
      return this.spacing / this.spacingModifier;
    }
  },

  created() {
    this.position = -this.value * this.spacingCalc;
    this.internalValue = this.value;
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.$refs.canvas.getContext("2d");
    this.canvas.width = 200;
    this.canvas.height = 40;

    this.context.fillStyle = "#333";
    this.context.strokeStyle = "#fff";
    this.context.textAlign = "center";
    requestAnimationFrame(this.draw);
  },

  methods: {
    draw() {
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
        context.fillRect(gap - 5, canvas.height / 2 - 5, 10, 10);

        context.fillStyle = "#fff";
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
      document.body.style.cursor = this.lastCursor;
    },

    mouseMove(e) {
      const comp = e.clientX - this.startX;
      let newPosition = this.position + (comp - this.lastComp);
      if (newPosition === this.position) {
        return;
      }

      let value = -newPosition / this.spacingCalc;
      this.lastComp = comp;

      if (value < this.min) {
        newPosition = -this.min * this.spacingCalc;
      }

      if (value > this.max) {
        newPosition = -this.max * this.spacingCalc;
      }

      this.position = newPosition;
      value = -newPosition / this.spacingCalc;

      this.internalValue = value;
      this.$emit("input", this.internalValue);
      this.inputValue = this.internalValue;
      requestAnimationFrame(this.draw);
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
  width: 200px;
  height: 40px;
  display: inline-block;
}

input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
