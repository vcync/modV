<template>
  <div ref="videoControl">
    <grid columns="6">
      <c>
        <Button @mousedown="onClickRestart">Restart</Button>
      </c>
      <c>
        <Button @mousedown="onClickPlayPause">
          {{ paused ? "Play" : "Pause" }}
        </Button>
      </c>
      <c span="4">
        <grid columns="10" class="center-align">
          <c span="1">Speed</c>
          <c span="6">
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.01"
              style="width: 100%"
              v-model="playbackRate"
          /></c>
          <c span="3">{{ playbackRate }}</c>
        </grid>
      </c>
    </grid>
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

<style>
grid.center-align {
  height: 100%;
}

grid.center-align c {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
