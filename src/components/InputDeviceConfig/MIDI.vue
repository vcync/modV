<template>
  <grid
    columns="4"
    class="device-config"
    v-searchTerms="{
      terms: ['midi', 'clock', 'input'],
      title: 'MIDI Input Config',
      type: 'Panel'
    }"
  >
    <c span="1">MIDI Inputs</c>
    <c span="1..">
      <grid columns="4">
        <c>Name</c>
        <c>Input</c>
        <c>Clock</c>
      </grid>
    </c>
    <c span="1.." v-for="(device, deviceId) in devices" :key="deviceId">
      <grid columns="4">
        <c>{{ device.name }}</c>
        <c>
          <button @click="toggleInput(deviceId, !device.listenForInput)">
            {{ device.listenForInput ? "On" : "Off" }}
          </button>
        </c>
        <c>
          <button @click="toggleClock(deviceId, !device.listenForClock)">
            {{ device.listenForClock ? "On" : "Off" }}
          </button>
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
export default {
  computed: {
    devices() {
      return this.$modV.store.state.midi.devices;
    }
  },

  methods: {
    toggleInput(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "listenForInput",
        value
      });
    },

    toggleClock(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "listenForClock",
        value
      });
    }
  }
};
</script>
