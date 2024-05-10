<template>
  <RightClickNumberInput
    v-bind="$props"
    class="range-control__number"
    @update:model-value="handleNumberInput"
  >
    <input
      type="range"
      v-bind="$props"
      @input="$emit('update:modelValue', parseFloat($event.target.value, 10))"
    />
  </RightClickNumberInput>
</template>

<script>
import RightClickNumberInput from "./RightClickNumberInput.vue";

export default {
  components: { RightClickNumberInput },
  props: {
    min: {},
    max: {},
    step: {},
    modelValue: {
      default: 0,
    },
  },
  emits: ["update:modelValue"],

  methods: {
    handleNumberInput(value) {
      let valueOut = parseFloat(value, 10);
      if (isNaN(valueOut)) {
        valueOut = 0;
      }

      this.$emit("update:modelValue", valueOut);
    },
  },
};
</script>

<style scoped>
.range-control__number {
  width: 100%;
  height: 16px;
  display: flex;
}

input {
  -webkit-appearance: none;
  background: transparent;
  margin: 0;
  width: 100%;
}

input::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #151515;
  height: 16px;
  width: 16px;
  border-radius: 50%;
}

input::-webkit-slider-runnable-track {
  width: 100%;
  height: 16px;
  background: #c4c4c4;
  border-radius: 23px;
}

/* input:focus::-webkit-slider-runnable-track,
input:focus {
  border-radius: 23px;
  outline: none;
  box-shadow: 0px 0px 1px 2px #151515;
} */
</style>
