<template>
  <div class="range-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <input
      :id='inputId'
      type='range'
      :min='min'
      :max='max'
      :step='step'
      v-model='value'
    >
    <input
        class="pure-form-message-inline"
        type='number'
        v-model='value'
        step='any'
      >
  </div>
</template>

<script>
  export default {
    name: 'rangeControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        value: undefined
      };
    },
    computed: {
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
    beforeMount() {
      this.value = this.module[this.variable];
      if(typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
      },
      value() {
        let val;
        if(this.varType === 'int') val = parseInt(this.value, 10);
        else if(this.varType === 'float') val = parseFloat(this.value, 10);
        this.module[this.variable] = val;
      }
    }
  };
</script>

<style scoped lang='scss'>
  input.pure-form-message-inline {
    max-width: 70px;
  }
</style>