<template>
  <span>
    <label for="">Opacity</label>
    <input
      class="opacity"
      type="range"
      min="0"
      max="1"
      step="0.0001"
      v-model.number="alpha"
    >
  </span>
</template>

<script>
  export default {
    name: 'opacityControl',
    props: [
      'moduleName',
    ],
    computed: {
      alpha: {
        get() {
          return this.$store.state.modVModules.active[this.moduleName].meta.alpha;
        },
        set(value) {
          this.$store.dispatch('modVModules/updateMeta', {
            name: this.moduleName,
            metaKey: 'alpha',
            data: value,
          });
        },
      },
    },
  };
</script>

<style>

</style>
