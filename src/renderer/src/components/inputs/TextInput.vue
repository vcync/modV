<template>
  <input
    type="text"
    ref="input"
    v-bind="attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  emits: ["update:modelValue"],
  props: ["modelValue"],
  methods: {
    focus() {
      this.$refs.input.focus();
    },
  },

  computed: {
    attrs() {
      // eslint-disable vue/no-deprecated-dollar-listeners-api
      const attrs = { ...this.$attrs };
      delete attrs.input;

      return attrs;
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
