<template>
  <span>bpm: {{ bpm }} {{ detect ? '🤖' : '' }}</span>
</template>

<script>
  export default {
    computed: {
      bpm() {
        return this.$store.state.tempo.bpm;
      },

      detect() {
        return this.$store.state.tempo.detect;
      },
    },
  };
</script>
