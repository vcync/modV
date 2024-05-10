<template>
  <label class="select">
    <select
      v-bind="$props"
      v-on="listeners"
      @change="$emit('input', $event.target.value)"
    >
      <slot />
    </select>
  </label>
</template>

<script>
export default {
  props: ["value"],

  computed: {
    listeners() {
      // eslint-disable vue/no-deprecated-dollar-listeners-api
      const listeners = { ...this.$listeners };
      delete listeners.change;
      delete listeners.input;

      return listeners;
    }
  }
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
