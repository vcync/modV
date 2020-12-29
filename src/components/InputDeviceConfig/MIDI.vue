<template>
  <grid
    v-infoView="{ title: iVTitle, body: iVBody, id: 'MIDI Config' }"
    v-searchTerms="{
      terms: ['midi', 'clock', 'input'],
      title: 'MIDI Input Config',
      type: 'Panel'
    }"
    columns="4"
    class="device-config"
  >
    <c span="1">MIDI Inputs</c>
    <c span="1..">
      <grid columns="5">
        <c>Name</c>
        <c>Input</c>
        <c>Clock</c>
        <c>CC Latch</c>
        <c>NoteOn Latch</c>
      </grid>
    </c>
    <c span="1.." v-for="(device, deviceId) in devices" :key="deviceId">
      <grid columns="5">
        <c>{{ device.name }}</c>
        <c>
          <Button
            class="light"
            @click="toggleInput(deviceId, !device.listenForInput)"
          >
            {{ device.listenForInput ? "On" : "Off" }}
          </Button>
        </c>
        <c>
          <Button
            class="light"
            @click="toggleClock(deviceId, !device.listenForClock)"
          >
            {{ device.listenForClock ? "On" : "Off" }}
          </Button>
        </c>
        <c>
          <Button
            class="light"
            @click="toggleCcLatch(deviceId, !device.ccLatch)"
          >
            {{ device.ccLatch ? "On" : "Off" }}
          </Button>
        </c>
        <c>
          <Button
            class="light"
            @click="toggleNoteOnLatch(deviceId, !device.noteOnLatch)"
          >
            {{ device.noteOnLatch ? "On" : "Off" }}
          </Button>
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
export default {
  data() {
    return {
      iVTitle: "MIDI Input Config",
      iVBody:
        "Configure your MIDI inputs here. Use the toggles to accept MIDI inputs (CC/notes) and MIDI Clock per device."
    };
  },

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
    },

    toggleCcLatch(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "ccLatch",
        value
      });
    },

    toggleNoteOnLatch(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "noteOnLatch",
        value
      });
    }
  }
};
</script>
