<template>
  <textarea
    :value="modelValue"
    :cols="cols"
    :rows="rows"
    @input="$emit('update:modelValue', $event.target.value)"
    @change="$emit('change', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    modelValue: {},
    cols: {},
    rows: {
      default: 3,
    },
  },
  emits: ["update:modelValue", "change"],
};
</script>

<style scoped>
textarea {
  -webkit-appearance: none;
  background: #c4c4c4;
  border: none;
  min-height: 24px;
  min-width: 120px;
  font-size: 14px;
  padding: 4px;
  box-sizing: border-box;
  width: 100%;
}
</style>
