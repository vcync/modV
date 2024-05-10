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
              :value="playbackrate"
              @input="playbackRateInput"
          /></c>
          <c span="3">{{ playbackrate }}</c>
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
      type: "string",
    },

    paused: {
      required: true,
      type: "boolean",
    },

    playbackrate: {
      required: true,
      type: "number",
    },
  },

  created() {
    const video = this.$modV.videos[this.videoId]?.video;
    this.$emit("ratechange", video.playbackrate);
    this.$emit(video.paused ? "pause" : "play");
  },

  methods: {
    getVideo() {
      // using a method instead of a computed property because of issues with Vue reactivity
      return this.$modV.videos[this.videoId]?.video;
    },

    onClickPlayPause() {
      const video = this.getVideo();

      if (video.paused) {
        video.play();
        this.$emit("play");
      } else {
        video.pause();
        this.$emit("pause");
      }
    },

    onClickRestart() {
      const video = this.getVideo();
      video.currentTime = 0;
      this.$emit("timeupdate", 0);
    },

    playbackRateInput(e) {
      const video = this.getVideo();
      const playbackRate = parseFloat(e.target.value);
      video.playbackRate = playbackRate;
      this.$emit("ratechange", playbackRate);
    },
  },
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
