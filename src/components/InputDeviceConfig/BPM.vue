<template>
  <grid columns="4" class="device-config">
    <c span="1..">BPM Source</c>
    <c span="3">
      <select v-model="bpmSource">
        <option
          v-for="(source, index) in bpmSources"
          :value="source"
          :key="index"
          >{{ source }}</option
        >
      </select>
    </c>
    <c span="1..">
      <button :disabled="bpmSource !== 'tap'" @mousedown="tap">TAP</button>
      {{ bpm }}
    </c>
  </grid>
</template>

<script>
import Tt from "tap-tempo";

const tapTempo = new Tt();

export default {
  created() {
    tapTempo.on("tempo", bpm => {
      if (this.bpm === Math.round(bpm)) {
        return;
      }
      this.$modV.store.dispatch("beats/setBpm", {
        bpm: Math.round(bpm),
        source: "tap"
      });
    });
  },

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
      }
    },

    bpmSources() {
      return this.$modV.store.state.beats.bpmSources;
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

    tap() {
      tapTempo.tap();
    }
  }
};
</script>
