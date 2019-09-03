<template>
  <div>
    <label><input type="checkbox" v-model="debug" /> Debug Canvas</label><br />
    <select v-model="debugId">
      <option value="main">Main Output</option>
      <option v-for="output in outputs" :key="output.id" :value="output.id">{{
        output.name
      }}</option>
    </select>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  computed: {
    outputs() {
      return this.$modV.store.state.outputs.auxillary;
    },

    debugId: {
      get() {
        return this.$modV.store.state.outputs.debugId;
      },

      set(value) {
        this.$modV.store.commit("outputs/SET_DEBUG_ID", value);
      }
    },

    debug: {
      get() {
        return this.$modV.store.state.outputs.debug;
      },

      set(value) {
        this.$modV.store.commit("outputs/TOGGLE_DEBUG", value);
      }
    }
  },

  mounted() {
    const { canvas } = this.$refs;
    const offscreen = canvas.transferControlToOffscreen();

    this.$modV.$worker.postMessage(
      {
        type: "dispatch",
        identifier: "outputs/setDebugContext",
        payload: offscreen
      },
      [offscreen]
    );
  }
};
</script>

<style scoped>
div {
  font-family: monospace;
  position: fixed;
  bottom: 0;
  right: 0;

  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  width: 300px;
}

canvas {
  width: 100%;
}
</style>
