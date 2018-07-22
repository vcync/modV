<template>
  <div class="checkbox-control" :data-moduleName="moduleName">
    <label :for="inputId" @click="labelClicked">
      {{ label }}
    </label>
    <b-checkbox
      v-model.boolean="value"
      :id="inputId"
    ></b-checkbox>
  </div>
</template>

<script>
  export default {
    name: 'rangeControl',
    props: [
      'module',
      'meta',
    ],
    computed: {
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
      moduleName() {
        return this.meta.$modv_moduleName;
      },
      label() {
        return this.meta.label || this.variable;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
    },
    beforeMount() {
      if (typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    methods: {
      labelClicked() {
        this.value = !this.value;
      },
    },
  };
</script>

<style scoped lang='scss'>

</style>
