<template>
  <grid
    v-searchTerms="{
      terms: ['bpm', 'tempo', 'beats per minute'],
      title: 'BPM Config',
      type: 'Panel',
    }"
    columns="4"
    class="device-config"
  >
    <c span="1..">BPM Source</c>
    <c span="3">
      <Select v-model="bpmSource" class="light">
        <option
          v-for="(source, index) in bpmSources"
          :key="index"
          :value="source"
        >
          {{ source }}
        </option>
      </Select>
    </c>
    <c span="1..">
      <Button class="light" :disabled="bpmSource !== 'tap'" @mousedown="tap"
        >TAP</Button
      >
      {{ bpm }}
    </c>
  </grid>
</template>

<script>
import Tt from "tap-tempo";

const tapTempo = new Tt();

export default {
  computed: {
    bpm() {
      return this.$modV.store.state.beats.bpm;
    },

    bpmSource: {
      get() {
        return this.$modV.store.state.beats.bpmSource;
      },

      set(source) {
        this.$modV.store.commit("beats/SET_BPM_SOURCE", { source });
      },
    },

    bpmSources() {
      return this.$modV.store.state.beats.bpmSources;
    },
  },
  created() {
    tapTempo.on("tempo", (bpm) => {
      if (this.bpm === Math.round(bpm)) {
        return;
      }
      this.$modV.store.dispatch("beats/setBpm", {
        bpm: Math.round(bpm),
        source: "tap",
      });
    });
  },

  methods: {
    toggleInput(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "listenForInput",
        value,
      });
    },

    toggleClock(id, value) {
      this.$modV.store.commit("midi/UPDATE_DEVICE", {
        id,
        key: "listenForClock",
        value,
      });
    },

    tap() {
      tapTempo.tap();
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
