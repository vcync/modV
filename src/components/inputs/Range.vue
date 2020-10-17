<template>
  <input
    type="range"
    @input="$emit('input', parseFloat($event.target.value, 10))"
    v-bind="$props"
    v-tooltip
  />
</template>

<script>
export default {
  props: {
    min: {},
    max: {},
    step: {},
    value: {
      default: 0
    }
  }
};
</script>

<style scoped>
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
