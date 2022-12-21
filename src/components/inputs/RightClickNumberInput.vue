<template>
  <div v-tooltip="{ visible: !editMode }">
    <div class="slot" v-show="!editMode" @click.right="toggleEditMode">
      <slot></slot>
    </div>

    <Number
      v-model="inputValue"
      type="number"
      :step="step"
      @keypress.enter="toggleEditMode"
      @click.right="toggleEditMode"
      @input="numberInputHandler"
      v-show="editMode"
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
    step: {
      type: Number,
      default: 0.001
    },
    default: Number,
    value: Number
  },

  data() {
    return {
      editMode: false,
      inputValue: 0
    };
  },

  created() {
    this.inputValue = this.value;
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

    numberInputHandler() {
      this.$emit("input", this.inputValue);
    },

    toggleEditMode(e) {
      e.preventDefault();
      this.editMode = !this.editMode;

      if (this.editMode) {
        this.$refs.input.focus();
      }
    }
  },

  watch: {
    value(value) {
      if (value < this.min || value > this.max) {
        return false;
      }

      this.inputValue = value;
    }
  }
};
</script>

<style scoped>
.slot {
  display: flex;
  align-items: center;
}
/* canvas {
  border-radius: 23px;
  width: 100%;
}

div {
  position: relative;
  width: 100%;
  height: 16px;
  display: inline-block;
}

input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
} */
</style>
