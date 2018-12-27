<template>
  <div>
    <button class="button" @click="start" :disabled="capturing">Start</button>
    <button class="button" @click="stop">Stop</button>
    <button class="button" @click="save">Save</button>
    <!-- <br>
    <label>Framerate: <input type="range" model="framerate" min="1" max="60" :disabled="capturing"></label><br>
    <label>Quality: <input type="range" model="quality" min="1" max="99" :disabled="capturing"></label><br>
    <label>Motion Blur Frames: <input type="range" min="1" max="16" model="motionBlurFrames" :disabled="capturing"></label> -->
  </div>
</template>

<script>
export default {
  name: 'ControlPanel',

  data() {
    return {
      framerate: 60,
      quality: 90,
      motionBlurFrames: 16,
      capturing: false,
    };
  },

  methods: {
    start() {
      this.capturer.start();
      this.capturing = true;
    },

    stop() {
      this.capturer.stop();
      this.capturing = false;
    },

    save() {
      this.capturer.save();
    },
  },

  computed: {
    capturer() {
      return this.$store.state.plugins.plugins.Capture.plugin.capturer;
    },
  },
};
</script>

<style>

</style>
