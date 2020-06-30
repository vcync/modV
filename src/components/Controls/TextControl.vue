<template>
  <div
    v-context-menu="menuOptions"
    class="text-control"
    :data-moduleName="moduleName"
  >
    <b-field :label="label">
      <b-input v-model="value" type="text"></b-input>
    </b-field>
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
  name: "TextControl",
  data() {
    return {
      menuOptions: {
        match: ["textControl"],
        menuItems: []
      }
    };
  },
  beforeMount() {
    this.$data.menuOptions.menuItems.push(
      new nw.MenuItem({
        label: this.label,
        enabled: false
      }),
      new nw.MenuItem({
        type: "separator"
      })
    );
  }
};
</script>
