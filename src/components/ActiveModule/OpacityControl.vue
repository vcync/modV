<template>
  <b-field
    horizontal
    label="Opacity"
  >
    <input
      class="opacity"
      type="range"
      min="0"
      max="1"
      step="0.0001"
      v-model.number="alpha"
    >
  </b-field>
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
          if (!this.moduleName) return 0;
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
