<template>
  <input
    type="text"
    ref="input"
    v-on="listeners"
    @input="$emit('input', $event.target.value)"
    v-bind="$props"
  />
</template>

<script>
export default {
  props: ["value"],
  methods: {
    focus() {
      this.$refs.input.focus();
    }
  },

  computed: {
    listeners() {
      // eslint-disable vue/no-deprecated-dollar-listeners-api
      const listeners = { ...this.$listeners };
      delete listeners.input;

      return listeners;
    }
  }
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
