<template>
  <div class="checkbox-control" :data-moduleName="moduleName">
    <label :for="inputId" @click="labelClicked">
      {{ label }}
    </label>
    <b-checkbox
      v-model="value"
      :id="inputId"
    ></b-checkbox>
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
    methods: {
      labelClicked() {
        this.value = !this.value;
      }
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
