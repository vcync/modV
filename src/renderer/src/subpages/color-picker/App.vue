<template>
  <div>
    <Sketch ref="picker" v-model="color" />
  </div>
</template>

<script>
import { Sketch } from "@ckpack/vue-color";

export default {
  components: {
    Sketch,
  },

  data() {
    return {
      color: "#ff0000ff",
      moduleId: null,
      prop: null,
      // hex, hsl, hsv, rgba, rgba-ratio
      returnFormat: "hex",
    };
  },

  watch: {
    color(color) {
      let data = color[this.returnFormat];

      if (this.returnFormat === "rgba-ratio") {
        data = {
          r: color.rgba.r / 255,
          g: color.rgba.g / 255,
          b: color.rgba.b / 255,
          a: color.rgba.a,
        };
      }

      window.electronMessagePort.postMessage({
        type: "input-update",
        payload: JSON.parse(
          JSON.stringify({
            moduleId: this.moduleId,
            prop: this.prop,
            data,
          }),
        ),
      });

      // ipcRenderer.send("input-update", {
      //   moduleId: this.moduleId,
      //   prop: this.prop,
      //   data,
      // });
    },
  },

  created() {
    window.addEventListener("message", (e) => {
      if (e.data === "port:colorPickerUI") {
        // port:colorPickerUI port is available
        window.electronMessagePort.start();

        window.electronMessagePort.addEventListener(
          "message",
          ({ data: messageData }) => {
            // colorPicker port.addEventListener fired", messageData
            if (messageData.type === "module-info") {
              const { moduleId, prop, data } = messageData.payload;
              this.moduleId = moduleId;
              this.prop = prop;
              if (this.returnFormat === "rgba-ratio") {
                this.color = {
                  rgba: {
                    r: data.r * 255,
                    g: data.g * 255,
                    b: data.b * 255,
                    a: data.a,
                  },
                };
              } else {
                this.color = data;
              }

              return;
            }

            if (messageData.type === "value") {
              this.color = messageData.payload;
              return;
            }

            if (messageData.type === "return-format") {
              this.returnFormat = messageData.payload;
              return;
            }
          },
        );
      }
    });
  },

  mounted() {
    window.addEventListener("resize", this.resize);
    this.resize();
  },

  beforeUnmount() {
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
  },
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
