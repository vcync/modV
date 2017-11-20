<template>
  <div class="column is-12 columns is-mobile is-multiline">
    <control-panel
      v-for="moduleName in panels"
      :moduleName="moduleName"
      :pinned="isPinned(moduleName)"
      :focused="isFocused(moduleName)"
      :key="moduleName"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import ControlPanel from '@/components/ControlPanel';

  export default {
    name: 'controlPanelHandler',
    data() {
      return {

      };
    },
    computed: {
      ...mapGetters('modVModules', [
        'focusedModule',
      ]),
      ...mapGetters('controlPanels', [
        'pinnedPanels',
      ]),
      focusedModuleName() {
        if (!this.focusedModule) return '';
        return this.focusedModule.info.name;
      },
      panels() {
        const panels = [].concat(this.pinnedPanels);

        if (this.focusedModule && !this.isPinned(this.focusedModuleName)) {
          panels.push(this.focusedModuleName);
        }

        return panels;
      },
    },
    methods: {
      ...mapGetters('modVModules', [
        'getActiveModule',
      ]),
      isPinned(moduleName) {
        return this.pinnedPanels.indexOf(moduleName) > -1;
      },
      isFocused(moduleName) {
        return moduleName === this.focusedModuleName;
      },
    },
    components: {
      ControlPanel,
    },
  };
</script>

<style scoped>

</style>
