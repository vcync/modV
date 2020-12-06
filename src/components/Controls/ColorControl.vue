<template>
  <div class="color-well">
    <input @click.prevent="openColorPicker" type="color" v-model="value" />
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  props: {
    value: {
      type: String,
      required: true
    },

    moduleId: {
      type: String,
      required: true
    },

    prop: {
      type: String,
      required: true
    }
  },

  methods: {
    openColorPicker() {
      ipcRenderer.send("open-window", "colorPicker");
      ipcRenderer.once("window-ready", (event, { window: windowName, id }) => {
        if (windowName !== "colorPicker") {
          return;
        }

        ipcRenderer.sendTo(id, "return-format", "hex");

        ipcRenderer.sendTo(id, "module-info", {
          moduleId: this.moduleId,
          prop: this.prop,
          data: this.value
        });
      });
    }
  }
};
</script>

<style></style>
