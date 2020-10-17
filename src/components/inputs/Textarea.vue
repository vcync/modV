<template>
  <textarea
    @input="$emit('input', $event.target.value)"
    :value="value"
    :cols="cols"
    :rows="rows"
  />
</template>

<script>
export default {
  props: {
    value: {},
    cols: {},
    rows: {
      default: 3
    }
  }
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
