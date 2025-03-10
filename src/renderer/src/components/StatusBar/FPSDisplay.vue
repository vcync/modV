<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'FPS Display' }"
    v-searchTerms="{
      terms: ['fps', 'frame', 'frame rate', 'frames', 'frames per second'],
      title: 'FPS Control',
      type: 'Status Bar Item',
      focusParent: true,
      isGLElement: false,
    }"
    @dblclick="openFrameRateDialog"
  >
    {{ Math.round($modV.store.state.metrics.fps) }} FPS
  </div>
</template>

<script>
export default {
  data() {
    return {
      iVTitle: "FPS Display",
      iVBody: "Double click to set the target FPS.",
    };
  },
  methods: {
    openFrameRateDialog() {
      this.$store.commit("dialogs/ADD_OPEN", "frameRate");
    },
  },
};
</script>
