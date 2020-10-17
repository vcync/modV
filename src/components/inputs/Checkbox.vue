<template>
  <label>
    <input
      type="checkbox"
      @input="$emit('input', $event.target.checked)"
      :checked="value"
    />
    <span></span>
  </label>
</template>

<script>
export default {
  props: ["value"]
};
</script>

<style scoped>
input {
  width: 0;
  height: 0;
}

label {
  width: 16px;
  height: 16px;
  background: #151515;
  position: relative;
  display: block;
}

label.light {
  background: #363636;
}

input:checked + span::before {
  content: "";
  width: 10px;
  height: 4px;
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 2px solid white;
  border-left: 2px solid white;
  transform: translateX(2px) translateY(3px) rotate(-45deg);
}

/* input:checked + span::after {
  content: "";
  width: 15px;
  height: 15px;
  display: inline-block;
  position: absolute;
  top: 2px;
  right: 3px;
  border-top: 2px solid white;
  transform: rotate(-45deg);
  transform-origin: right top;
} */
</style>
