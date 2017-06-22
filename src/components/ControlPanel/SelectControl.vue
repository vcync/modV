<template>
  <div class="range-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <dropdown :data='enumVals' :grouped='grouped' :cbChanged="dropdownChanged"></dropdown>
    <div class="pure-form-message-inline">{{ value }}</div>
  </div>
</template>

<script>
  export default {
    name: 'selectControl',
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
      enumVals() {
        return this.control.enum;
      },
      grouped() {
        return this.control.grouped;
      }
    },
    methods: {
      dropdownChanged(item) {
        this.value = item[0].value;
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

</style>