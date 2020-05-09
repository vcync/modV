<template>
  <grid columns="4" class="device-config">
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
