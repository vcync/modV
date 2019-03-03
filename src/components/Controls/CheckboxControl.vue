<template>
  <div class="checkbox-control" :data-moduleName="moduleName">
    <label :for="inputId" @click="labelClicked">
      {{ label }}
    </label>
    <b-checkbox :id="inputId" v-model="value"></b-checkbox>
  </div>
</template>

<script>
export default {
  name: 'RangeControl',
  beforeMount() {
    if (typeof this.value === 'undefined') this.value = this.defaultValue
  },
  methods: {
    labelClicked() {
      this.value = !this.value
    }
  }
}
</script>

<style scoped lang="scss"></style>
