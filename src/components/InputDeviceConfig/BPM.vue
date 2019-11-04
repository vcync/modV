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
  </grid>
</template>

<script>
export default {
  computed: {
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
    }
  }
};
</script>

<style scoped>
.device-config {
  padding: 1em;
}
</style>
