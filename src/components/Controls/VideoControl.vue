<template>
  <div ref="videoControl">
    <button @mousedown="onClickRestart">Restart</button>
    <button @mousedown="onClickPlayPause">
      {{ paused ? "Play" : "Pause" }}
    </button>
    <label
      >Speed<input
        type="range"
        min="0.5"
        max="2"
        step="0.01"
        v-model="playbackRate"
      />
      {{ playbackRate }}</label
    >
  </div>
</template>

<script>
export const VideoControl = {
  props: {
    videoId: {
      required: true,
      type: "string"
    }
  },

  data() {
    return {
      playbackRate: 1,
      paused: false
    };
  },

  computed: {
    video() {
      return this.$modV.videos[this.videoId]?.video;
    }
  },

  created() {
    const { video } = this;
    this.playbackRate = video.playbackRate;
    this.paused = video.paused;
  },

  methods: {
    onClickPlayPause() {
      this.paused = !this.paused;

      if (this.paused) {
        this.video.pause();
      } else {
        this.video.play();
      }
    },

    onClickRestart() {
      this.video.currentTime = 0;
    }
  },

  watch: {
    playbackRate(value) {
      this.video.playbackRate = value;
    }
  }
};

export default VideoControl;
</script>
