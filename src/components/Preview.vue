<template>
  <grid
    class="preview"
    ref="container"
    v-searchTerms="{
      terms: ['preview', 'canvas', 'debugger'],
      title: 'Canvas Debugger',
      type: 'Panel'
    }"
  >
    <c span="1..">
      <Select class="light" v-model="debugId">
        <option value="main">Main Output</option>
        <optgroup
          v-for="(outputs, group) in groups"
          :label="group"
          :key="group"
        >
          <option
            v-for="output in outputs"
            :key="output.id"
            :value="output.id"
            >{{ output.name }}</option
          >
        </optgroup>
      </Select>
    </c>

    <c span="1..">
      <canvas ref="canvas"></canvas>
    </c>
  </grid>
</template>

<script>
export default {
  data() {
    return {
      resizeObserver: null
    };
  },

  mounted() {
    const { canvas, container } = this.$refs;
    const offscreen = canvas.transferControlToOffscreen();

    this.$modV.$worker.postMessage(
      {
        type: "dispatch",
        identifier: "outputs/setDebugContext",
        payload: offscreen
      },
      [offscreen]
    );

    this.resizeObserver = new ResizeObserver(entries => {
      requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }

        this.resize(entries);
      });
    }).observe(container);

    this.$modV.store.commit("outputs/TOGGLE_DEBUG", true);
  },

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
    }
  },

  methods: {
    resize(e) {
      const { width } = e[0].contentRect;

      this.$modV.$worker.postMessage({
        type: "dispatch",
        identifier: "outputs/resizeDebug",
        payload: { width }
      });
    }
  }
};
</script>

<style scoped>
.preview {
  overflow: hidden;
}

canvas {
  width: 100%;
}
</style>
