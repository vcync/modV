<template>
  <div
    v-context-menu="menuOptions"
    class="button-control"
    :data-moduleName="moduleName"
  >
    <label :for="inputId">
      {{ label }}
    </label>
    <button
      @mousedown="setValue(true)"
      @mouseup="setValue(false)"
      @touchstart="setValue(true)"
      @touchend="setValue(false)"
      @keydown.space="setValue(true)"
      @keyup.space="setValue(false)"
    >
      {{ label }}
    </button>
  </div>
</template>

<script>
import { Menu, MenuItem } from "nwjs-menu-browser";

if (!window.nw) {
  window.nw = {
    Menu,
    MenuItem
  };
}

const nw = window.nw;

export default {
  data() {
    return {
      menuOptions: {
        match: ["buttonControl"],
        menuItems: []
      }
    };
  },

  beforeMount() {
    this.currentValue = this.processedValue || this.defaultValue;

    this.$data.menuOptions.menuItems.push(
      new nw.MenuItem({
        label: this.label,
        enabled: false
      }),
      new nw.MenuItem({
        type: "separator"
      })
    );
  },

  methods: {
    setValue(data) {
      this.$store.dispatch("modVModules/updateProp", {
        name: this.moduleName,
        prop: this.variable,
        data
      });
    }
  }
};
</script>

<style scoped></style>
