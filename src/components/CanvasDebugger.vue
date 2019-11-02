<template>
  <div>
    <label><input type="checkbox" v-model="debug" /> Debug Canvas</label><br />
    <select v-model="debugId">
      <option value="main">Main Output</option>
      <optgroup v-for="(outputs, group) in groups" :label="group" :key="group">
        <option v-for="output in outputs" :key="output.id" :value="output.id">{{
          output.name
        }}</option>
      </optgroup>
    </select>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  computed: {
    auxillaries() {
      return this.$modV.store.state.outputs.auxillary;
    },

    groups() {
      const groups = {};
      const auxValues = Object.values(this.auxillaries);
      for (let i = 0, len = auxValues.length; i < len; i++) {
        const aux = auxValues[i];

        if (!groups[aux.group]) {
          groups[aux.group] = {};
        }

        groups[aux.group][aux.id] = aux;
      }

      return groups;
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
  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
}

canvas {
  width: 100%;
}
</style>
