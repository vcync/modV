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
