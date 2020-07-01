<template>
  <div
    v-context-menu="menuOptions"
    class="checkbox-control"
    :data-moduleName="moduleName"
  >
    <label :for="inputId" @click="labelClicked">
      {{ label }}
    </label>
    <b-checkbox :id="inputId" v-model="massagedValue"></b-checkbox>
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
  name: "CheckboxControl",
  data() {
    return {
      menuOptions: {
        match: ["checkboxControl"],
        menuItems: []
      }
    };
  },

  computed: {
    massagedValue: {
      get() {
        return !!this.value;
      },

      set(value) {
        this.value = value;
      }
    }
  },

  beforeMount() {
    if (typeof this.value === "undefined") {
      this.value = this.defaultValue;
    }

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
    labelClicked() {
      this.value = !this.value;
    }
  }
};
</script>

<style scoped lang="scss"></style>
