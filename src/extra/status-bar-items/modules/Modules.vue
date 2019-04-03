<template>
  <span>modules: {{ nonGalleryModules }}</span>
</template>

<script>
export default {
  computed: {
    activeModules() {
      return this.$store.state.modVModules.active
    },
    nonGalleryModules() {
      return Object.keys(this.activeModules).filter(
        moduleName => moduleName.indexOf('-gallery') < 0
      ).length
    }
  }
}
</script>
