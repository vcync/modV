<template>
  <div>
    <Sketch :value="color" @input="updateValue" ref="picker" />
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { Sketch } from "vue-color";

export default {
  components: {
    Sketch
  },

  data() {
    return {
      color: "#ff0000ff",
      moduleId: null,
      prop: null,
      // hex, hsl, hsv, rgba, rgba-ratio
      returnFormat: "hex"
    };
  },

  created() {
    ipcRenderer.on("module-info", (event, { moduleId, prop, data }) => {
      this.moduleId = moduleId;
      this.prop = prop;

      if (this.returnFormat === "rgba-ratio") {
        this.color = {
          r: data.r * 255,
          g: data.g * 255,
          b: data.b * 255,
          a: data.a
        };
      } else {
        this.color = data;
      }
    });

    ipcRenderer.on("value", (event, message) => {
      this.color = message;
    });

    ipcRenderer.on("return-format", (event, message) => {
      this.returnFormat = message;
    });
  },

  mounted() {
    window.addEventListener("resize", this.resize);
    this.resize();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  },

  methods: {
    resize(e) {
      const pickerRect = this.$refs.picker.$el.getBoundingClientRect();
      if (e) {
        e.preventDefault();
      }
      window.resizeTo(pickerRect.width, pickerRect.height);
    },

    updateValue(color) {
      this.color = color;

      let data = color[this.returnFormat];

      if (this.returnFormat === "rgba-ratio") {
        data = {
          r: color.rgba.r / 255,
          g: color.rgba.g / 255,
          b: color.rgba.b / 255,
          a: color.rgba.a
        };
      }

      ipcRenderer.send("input-update", {
        moduleId: this.moduleId,
        prop: this.prop,
        data
      });
    }
  }
};
</script>

<style>
body {
  margin: 0;
  -webkit-app-region: drag;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", "微軟雅黑", "Microsoft YaHei", "微軟正黑體",
    "Microsoft JhengHei", Verdana, Arial, sans-serif !important;
}

.vc-sketch > * {
  -webkit-app-region: no-drag;
}
</style>
