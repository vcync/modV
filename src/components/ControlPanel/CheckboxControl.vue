<template>
  <div class="range-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <div class='customCheckbox'>
      <input
        :id='inputId'
        type='checkbox'
        v-model='value'
      >
      <label :for='inputId'></label>
    </div>
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
      defaultValue() {
        return this.control.checked;
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
        this.module[this.variable] = this.value;
      }
    }
  };
</script>

<style scoped lang='scss'>
  .customCheckbox label {
    text-align: initial;
    display: initial;
    vertical-align: initial;
    width: 20px;
    margin: initial;
  }
</style>