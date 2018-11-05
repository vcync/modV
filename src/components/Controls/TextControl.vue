<template>
  <div class="text-control" :data-moduleName='moduleName' v-context-menu='menuOptions'>
    <b-field :label="label">
      <b-input
        type="text"
        v-model.string="value"
      ></b-input>
    </b-field>
  </div>
</template>

<script>
  import { Menu, MenuItem } from 'nwjs-menu-browser';

  if (!window.nw) {
    window.nw = {
      Menu,
      MenuItem,
    };
  }

  const nw = window.nw;

  export default {
    name: 'textControl',
    data() {
      return {
        menuOptions: {
          match: ['textControl'],
          menuItems: [],
        },
      };
    },
    beforeMount() {
      this.$data.menuOptions.menuItems.push(
        new nw.MenuItem({
          label: this.label,
          enabled: false,
        }),
        new nw.MenuItem({
          type: 'separator',
        }),
      );
    },
  };
</script>
