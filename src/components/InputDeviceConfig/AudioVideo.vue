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
              <Select class="light" v-model="currentAudioSource">
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
              Video Input
            </c>
            <c span="3">
              <Select class="light" v-model="currentVideoSource">
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
              <Button class="light" @click="renumerate">Re-scan devices</Button>
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
      iVBody:
        "Configure your audio and video inputs here. Click Renumerate Devices to scan for new sources."
    };
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

      set(value) {
        this.$modV.setupMedia({ audioId: value });
      }
    },

    currentVideoSource: {
      get() {
        return this.$modV.store.state.mediaStream.currentVideoSource;
      },

      set(value) {
        this.$modV.setupMedia({ videoId: value });
      }
    }
  },

  methods: {
    renumerate() {
      this.$modV.enumerateDevices();
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
