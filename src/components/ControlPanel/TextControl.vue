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
    props: [
      'meta',
    ],
    data() {
      return {
        menuOptions: {
          match: ['textControl'],
          menuItems: [],
        },
      };
    },
    computed: {
      moduleName() {
        return this.meta.$modv_moduleName;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      value: {
        get() {
          return this.$store.state.modVModules.active[this.moduleName][this.variable];
        },
        set(value) {
          this.$store.dispatch('modVModules/updateProp', {
            name: this.moduleName,
            prop: this.variable,
            data: value,
          });
        },
      },
      variable() {
        return this.meta.$modv_variable;
      },
      label() {
        return this.meta.label || this.variable;
      },
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
