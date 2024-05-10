<template>
  <label class="select">
    <select
      v-bind="attrs"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
  </label>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: undefined,
    },
  },

  emits: ["update:modelValue"],

  computed: {
    attrs() {
      const attrs = { ...this.$attrs };
      delete attrs.onChange;
      delete attrs.onInput;

      return attrs;
    },
  },
};
</script>

<style scoped>
select {
  -webkit-appearance: none;
  background: #c4c4c4;
  border: none;
  height: 16px;
  font-size: 14px;
  padding: 0 4px;
  box-sizing: border-box;
  width: 100%;
  line-height: 1;
}

label {
  position: relative;
  width: 100%;
  height: 16px;
  display: flex;
}

label::before {
  content: "";
  height: 16px;
  width: 16px;
  top: 0;
  right: 0;
  position: absolute;
  background: #151515;
  pointer-events: none;
}

label.light::before {
  background: #363636;
}
</style>
