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
      v-model='currentValue'
      @input='numberInput'
    >
    <input
        class="pure-form-message-inline"
        type='number'
        v-model='currentValue'
        step='any'
        @input='numberInput'
      >
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
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
        valueIn: 0,
        updateQueue: [],
        currentValue: 0,
        raf: null,
        lastLength: 0
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
      ...mapActions('modVModules', [
        'setActiveModuleControlValue'
      ]),
      numberInput(e) {
        this.$data.valueIn = e.target.value;
      },
      updateLoop() {
        this.$data.raf = requestAnimationFrame(this.updateLoop.bind(this));
        const queue = this.$data.updateQueue;

        if(queue.length < 1) return;

        /* if(queue.length !== this.$data.lastLength) {
          this.$data.lastLength = queue.length;
          return;
        }*/

        const index = queue.length - 1;

        this.$data.currentValue = queue[index];

        queue.splice(0, index + 1);
      }
    },
    beforeMount() {
      this.$data.currentValue = this.processedValue;
      this.$data.updateQueue = [];

      this.$data.raf = requestAnimationFrame(this.updateLoop.bind(this));

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
    beforeDestroy() {
      cancelAnimationFrame(this.$data.raf);
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
      },
      processedValue() {
        this.$data.updateQueue.push(this.processedValue);
      }
    }
  };
</script>

<style scoped lang='scss'>
  input.pure-form-message-inline {
    max-width: 70px;
  }
</style>
