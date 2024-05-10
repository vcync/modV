<template>
  <input
    ref="input"
    type="number"
    v-bind="{ ...attrs, min, max, step, value: modelValue }"
    @input="$emit('update:modelValue', parseFloat($event.target.value, 10))"
  />
</template>

<script>
export default {
  props: ["min", "max", "step", "modelValue"],
  emits: ["update:modelValue"],

  computed: {
    attrs() {
      const attrs = { ...this.$attrs };
      delete attrs.onInput;

      return attrs;
    },
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
  },
};
</script>

<style scoped>
input {
  -webkit-appearance: none;
  background: #c4c4c4;
  border: none;
  height: 16px;
  font-size: 14px;
  padding: 0 4px;
  box-sizing: border-box;
  width: 100%;
}
</style>
