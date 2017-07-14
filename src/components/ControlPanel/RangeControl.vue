<template>
  <div class="range-control" :data-moduleName='moduleName' v-context-menu='menuOptions'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <input
      :id='inputId'
      type='range'
      :min='min'
      :max='max'
      :step='step'
      v-model='processedValue'
      @input='numberInput'
    >
    <input
        class="pure-form-message-inline"
        type='number'
        v-model='processedValue'
        step='any'
        @input='numberInput'
      >
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  import { Menu, MenuItem } from 'nwjs-menu-browser';

  if(!window.nw) {
    window.nw = {
      Menu,
      MenuItem
    };
  }

  const nw = window.nw;

  export default {
    name: 'rangeControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        menuOptions: {
          match: ['rangeControl'],
          menuItems: []
        },
        valueIn: 0
      };
    },
    computed: {
      processedValue() {
        return this.getValueFromActiveModule(this.moduleName, this.variable).processed;
      },
      ...mapGetters('modVModules', [
        'getValueFromActiveModule'
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
      varType() {
        return this.control.varType;
      },
      min() {
        return this.control.min;
      },
      max() {
        return this.control.max;
      },
      step() {
        return this.control.step;
      },
      defaultValue() {
        return this.control.default;
      }
    },
    methods: {
      ...mapMutations('modVModules', [
        'setActiveModuleControlValue'
      ]),
      numberInput(e) {
        this.$data.valueIn = e.target.value;
      }
    },
    beforeMount() {
      this.$data.menuOptions.menuItems.push(
        new nw.MenuItem({
          label: this.label,
          enabled: false
        }),
        new nw.MenuItem({
          type: 'separator'
        })
      );
    },
    watch: {
      valueIn() {
        const value = this.valueIn;

        let val;
        if(this.varType === 'int') val = parseInt(value, 10);
        else if(this.varType === 'float') val = parseFloat(value, 10);
        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: val
        });
      }
    }
  };
</script>

<style scoped lang='scss'>
  input.pure-form-message-inline {
    max-width: 70px;
  }
</style>