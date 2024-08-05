<template>
  <div v-tooltip="{ mouseover: true, message }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: () => "",
    },
  },
};
</script>
