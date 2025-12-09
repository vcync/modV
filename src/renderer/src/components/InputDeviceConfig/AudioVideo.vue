<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Media Input Config' }"
    v-searchTerms="{
      terms: ['audio', 'video', 'input'],
      title: 'Audio/Video Input Config',
      type: 'Panel',
    }"
    class="device-config"
  >
    <div>
      <grid class="borders">
        <c span="1..">
          <grid columns="4">
            <c span="1">Audio Input</c>
            <c span="3">
              <Select
                v-model="currentAudioSource"
                class="light"
                :disabled="switchingAudio"
              >
                <option
                  v-for="input in audioInputs"
                  :key="input.deviceId"
                  :value="input.deviceId"
                >
                  {{ input.label }}
                </option>
              </Select>
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1">Audio Gain</c>
            <c span="2">
              <Range
                v-model="gainRangeValue"
                :min="minGain"
                :max="maxGain"
                :step="0.01"
              />
            </c>
            <c>({{ gainRangeValue.toFixed(2) }})</c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1">Video Inputs</c>
            <c span="3">
              <grid columns="3" class="video-inputs-grid">
                <c
                  v-for="input in videoInputs"
                  :key="input.deviceId"
                  class="video-input-item"
                >
                  <grid columns="2">
                    <c style="width:16px">
                      <Checkbox
                        class="light"
                        :model-value="selectedVideoSourceIds.includes(input.deviceId)"
                        :emit-boolean="true"
                        @update:modelValue="(v) => toggleVideoDevice(input.deviceId, v)"
                        :disabled="switchingVideo"
                      />
                    </c>
                    <c>
                      <span class="video-input-label">{{ input.label }}</span>
                    </c>
                  </grid>
                </c>
              </grid>
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
      gainRangeValue: 1,
    };
  },

  computed: {
    audioInputs() {
      const audioInputs = Object.values(
        this.$modV.store.state.mediaStream.audio,
      );

      return audioInputs.sort((a, b) => a.label.localeCompare(b.label));
    },

    videoInputs() {
      const videoInputs = Object.values(
        this.$modV.store.state.mediaStream.video,
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
      },
    },

    selectedVideoSourceIds() {
      return (
        this.$modV.store.state.mediaStream.selectedVideoSources ||
        (this.$modV.store.state.mediaStream.currentVideoSource
          ? [this.$modV.store.state.mediaStream.currentVideoSource]
          : [])
      );
    },

    maxGain() {
      const value = this.$modV.gainNode?.gain.maxValue
        .toPrecision(1 + 2)
        .split("e")[0];

      return Number(value);
    },

    minGain() {
      return 0;
    },
  },

  watch: {
    gainRangeValue(value) {
      this.$modV.gainNode.gain.value = value;
    },
  },

  created() {
    const value = this.$modV.gainNode?.gain.value ?? 1;
    this.gainRangeValue = Number(value);
  },

  methods: {
    toggleVideoDevice(deviceId, enabled) {
      this.switchingVideo = true;
      if (enabled) {
        this.$modV.setupMedia({ videoId: deviceId });
      } else {
        // Stop and remove this device stream if present
        if (this.$modV._imageCaptures && this.$modV._imageCaptures[deviceId]) {
          try {
            const track = this.$modV._imageCaptures[deviceId].track;
            track && track.stop && track.stop();
          } catch (e) {}
          delete this.$modV._imageCaptures[deviceId];
        }
        if (this.$modV.videoStreams && this.$modV.videoStreams[deviceId]) {
          try {
            this.$modV.videoStreams[deviceId].pause();
          } catch (e) {}
          this.$modV.videoStreams[deviceId].srcObject = null;
          delete this.$modV.videoStreams[deviceId];
        }
        // Stop capture loop for this device
        this.$modV.stopCaptureForDevice && this.$modV.stopCaptureForDevice(deviceId);
        // Inform worker to remove aux for this device if one exists
        this.$modV.store.dispatch("outputs/removeWebcamOutputForDevice", {
          deviceId,
        });
        this.$modV.store.commit("mediaStream/REMOVE_SELECTED_VIDEO_SOURCE", {
          videoId: deviceId,
        });
      }
      this.switchingVideo = false;
    },
    renumerate() {
      this.$modV.enumerateDevices();
    },
  },
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
