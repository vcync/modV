<template>
  <span>
    <label for="">Opacity</label>
    <input type="range" min="0" max="1" step="0.0001" class="opacity" v-model="alpha">
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
          return this.$store.state.modVModules.active[this.moduleName].info.alpha;
        },
        set(value) {
          this.$store.dispatch('modVModules/setActiveModuleInfo', {
            moduleName: this.moduleName,
            key: 'alpha',
            value,
          });
        },
      },
    },
  };
</script>

<style>

</style>
