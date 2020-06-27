<template>
  <grid
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Media Input Config' }"
    v-searchTerms="{
      terms: ['audio', 'video', 'input'],
      title: 'Audio/Video Input Config',
      type: 'Panel'
    }"
    columns="4"
    class="device-config"
  >
    <c span="1">Audio Input</c>
    <c span="3">
      <select v-model="currentAudioSource">
        <option
          v-for="input in audioInputs"
          :key="input.deviceId"
          :value="input.deviceId"
          >{{ input.label }}</option
        >
      </select>
    </c>

    <c span="1">Video Input</c>
    <c span="3">
      <select v-model="currentVideoSource">
        <option
          v-for="input in videoInputs"
          :key="input.deviceId"
          :value="input.deviceId"
          >{{ input.label }}</option
        >
      </select>
    </c>

    <c span="1..">
      <button @click="renumerate">Renumerate Devices</button>
    </c>
  </grid>
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
      return this.$modV.store.state.mediaStream.audio;
    },

    videoInputs() {
      return this.$modV.store.state.mediaStream.video;
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
