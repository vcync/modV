<template>
  <div
    class="device-config"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Media Input Config' }"
    v-searchTerms="{
      terms: ['audio', 'video', 'input'],
      title: 'Audio/Video Input Config',
      type: 'Panel'
    }"
  >
    <div>
      <grid class="borders">
        <c span="1..">
          <grid columns="4">
            <c span="1">
              Audio Input
            </c>
            <c span="3">
              <Select
                class="light"
                v-model="currentAudioSource"
                :disabled="switchingAudio"
              >
                <option
                  v-for="input in audioInputs"
                  :key="input.deviceId"
                  :value="input.deviceId"
                  >{{ input.label }}</option
                >
              </Select>
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1">
              Audio Gain
            </c>
            <c span="2">
              <Range
                :min="minGain"
                :max="maxGain"
                step="0.01"
                v-model="gainRangeValue"
              />
            </c>
            <c>({{ gainRangeValue.toFixed(2) }})</c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1">
              Video Input
            </c>
            <c span="3">
              <Select
                class="light"
                v-model="currentVideoSource"
                :disabled="switchingVideo"
              >
                <option
                  v-for="input in videoInputs"
                  :key="input.deviceId"
                  :value="input.deviceId"
                  >{{ input.label }}</option
                >
              </Select>
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="2+3">
              <Button class="light" @click="renumerate">Re-scan Devices</Button>
            </c>
          </grid>
        </c>
      </grid>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      iVTitle: "Media Input Config",
      iVBody: `Configure your audio and video inputs here. Click "Re-scan Devices" to scan for new sources.`,
      switchingAudio: false,
      switchingVideo: false,
      gainRangeValue: 1
    };
  },

  created() {
    this.gainRangeValue = this.$modV.gainNode?.gain.value ?? 1;
  },

  computed: {
    audioInputs() {
      const audioInputs = Object.values(
        this.$modV.store.state.mediaStream.audio
      );

      return audioInputs.sort((a, b) => a.label.localeCompare(b.label));
    },

    videoInputs() {
      const videoInputs = Object.values(
        this.$modV.store.state.mediaStream.video
      );

      return videoInputs.sort((a, b) => a.label.localeCompare(b.label));
    },

    currentAudioSource: {
      get() {
        return this.$modV.store.state.mediaStream.currentAudioSource;
      },

      async set(value) {
        this.switchingAudio = true;
        await this.$modV.setupMedia({ audioId: value });
        this.switchingAudio = false;
      }
    },

    currentVideoSource: {
      get() {
        return this.$modV.store.state.mediaStream.currentVideoSource;
      },

      set(value) {
        this.switchingVideo = true;
        this.$modV.setupMedia({ videoId: value });
        this.switchingVideo = false;
      }
    },

    maxGain() {
      return this.$modV.gainNode?.gain.maxValue.toPrecision(1 + 2).split("e")[0];
    },

    minGain() {
      return 0;
    }
  },

  methods: {
    renumerate() {
      this.$modV.enumerateDevices();
    }
  },

  watch: {
    gainRangeValue(value) {
      this.$modV.gainNode.gain.value = value;
    }
  }
};
</script>

<style scoped>
.device-config input,
.device-config textarea,
.device-config .select {
  max-width: 120px !important;
}

.device-config .range-control {
  max-width: 240px !important;
}
</style>
