<template>
  <div class="text-control" :data-moduleName='moduleName' v-context-menu='menuOptions'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <input
      :id='inputId'
      type='text'
      v-model='processedValue'
      @input='textInput'
    >
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
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
      'module',
      'control',
    ],
    data() {
      return {
        menuOptions: {
          match: ['textControl'],
          menuItems: [],
        },
        valueIn: 0,
      };
    },
    computed: {
      processedValue() {
        return this.getValueFromActiveModule(this.moduleName, this.variable).processed;
      },
      ...mapGetters('modVModules', [
        'getValueFromActiveModule',
      ]),
      moduleName() {
        return this.module.info.name;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      label() {
        return this.control.label;
      },
      variable() {
        return this.control.variable;
      },
      defaultValue() {
        return this.control.default;
      },
    },
    methods: {
      ...mapMutations('modVModules', [
        'setActiveModuleControlValue',
      ]),
      textInput(e) {
        this.$data.valueIn = e.target.value;
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
    watch: {
      valueIn() {
        const value = this.valueIn;

        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value,
        });
      },
    },
  };
</script>

<style scoped lang='scss'>
  input.pure-form-message-inline {
    max-width: 70px;
  }
</style>
