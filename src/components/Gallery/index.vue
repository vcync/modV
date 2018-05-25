<template>
  <div class="gallery columns is-gapless" @drop="drop" @dragover="dragover">
    <div class="column is-12">
      <search-bar
        :phrase.sync="phrase"
        class="search-bar-wrapper"
        @menuIconClicked="menuIconClicked"
      ></search-bar>
    </div>

    <div class="column is-12 full-height">
      <b-tabs class="make-flex-fit" :animated="false">
        <b-tab-item class="make-flex-fit" label="Modules" v-bar="{ useScrollbarPseudo: true }">
          <module-gallery :phrase="phrase"></module-gallery>
        </b-tab-item>

        <b-tab-item label="Presets" v-bar="{ useScrollbarPseudo: true }">
          <preset-gallery :phrase="phrase"></preset-gallery>
        </b-tab-item>

        <b-tab-item label="Palettes" v-bar="{ useScrollbarPseudo: true }">
          <palette-gallery :phrase="phrase"></palette-gallery>
        </b-tab-item>

        <b-tab-item label="Images" disabled>

        </b-tab-item>

        <b-tab-item label="Videos" disabled>

        </b-tab-item>

        <b-tab-item label="Plugins" v-bar="{ useScrollbarPseudo: true }">
          <plugin-gallery :phrase="phrase"></plugin-gallery>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';

  import ModuleGallery from '@/components/Gallery/ModuleGallery';
  import PaletteGallery from '@/components/Gallery/PaletteGallery';
  import PluginGallery from '@/components/Gallery/PluginGallery';
  import PresetGallery from '@/components/Gallery/PresetGallery';
  import SearchBar from '@/components/Gallery/SearchBar';

  export default {
    name: 'gallery',
    data() {
      return {
        currentActiveDrag: null,
        phrase: '',
      };
    },
    computed: {
      ...mapGetters('modVModules', {
        currentDragged: 'currentDragged',
        modules: 'registry',
      }),
    },
    methods: {
      ...mapActions('modVModules', [
        'removeActiveModule',
      ]),
      ...mapMutations('modVModules', [
        'setCurrentDragged',
      ]),
      ...mapMutations('layers', [
        'removeModuleFromLayer',
      ]),
      menuIconClicked() {
        this.$emit('menuIconClicked');
      },
      drop(e) {
        e.preventDefault();
        const moduleName = e.dataTransfer.getData('module-name');
        const layerIndex = e.dataTransfer.getData('layer-index');

        this.removeModuleFromLayer({ moduleName, layerIndex });
        this.removeActiveModule({ moduleName });

        this.setCurrentDragged({ moduleName: null });
      },
      dragover(e) {
        e.preventDefault();
        if (!this.currentDragged) return;
        const draggedNode = document.querySelectorAll(`.active-item[data-module-name="${this.currentDragged}"]`)[1];
        draggedNode.classList.add('deletable');
      },
      dragleave(e) {
        e.preventDefault();
        if (!this.currentDragged) return;
        const draggedNode = document.querySelectorAll(`.active-item[data-module-name="${this.currentDragged}"]`)[1];
        draggedNode.classList.remove('deletable');
      },
    },
    components: {
      ModuleGallery,
      PaletteGallery,
      PluginGallery,
      PresetGallery,
      SearchBar,
    },
  };
</script>

<style lang="scss">
  .make-flex-fit {
    // flex: 1 1 auto;
    height: 100%;
  }

  .gallery {
    .b-tabs {
      &.make-flex-fit {
        height: calc(100% - 56px);
      }

      .tab-content {
        // flex: 1 1 auto;
        height: calc(100% - 41px);
      }

      .tab-item {
        margin-top: 5pt;
      }
    }

    .full-height {
      height: 100%;
    }
  }
</style>

<style scoped lang="scss">
  .gallery {
    background-color: #303030;
    box-sizing: border-box;
    min-width: 600px;
    overflow: hidden;
    padding: 5pt 5pt 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
    align-items: stretch;
  }

  .search-bar-wrapper {
    order: 0;
    flex: 0 1 auto;
    align-self: auto;
  }
</style>
