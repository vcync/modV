<template>
  <div @dblclick="openFrameRateDialog">
    {{ Math.round($modV.store.state.metrics.fps) }} FPS
  </div>
</template>

<script>
export default {
  methods: {
    openFrameRateDialog() {
      this.$store.commit("dialogs/ADD_OPEN", "frameRate");
    }
  }
};
</script>
