<template>
  <div class="gallery columns is-gapless">
    <div class="column is-12">
      <search-bar
        :phrase.sync="phrase"
        class="search-bar-wrapper"
        @menuIconClicked="menuIconClicked"
      ></search-bar>
    </div>

    <div class="column is-12 full-height">
      <b-tabs class="make-flex-fit" :animated="false">
        <b-tab-item
          v-bar="{ useScrollbarPseudo: true }"
          class="make-flex-fit"
          label="Modules"
        >
          <module-gallery :phrase="phrase"></module-gallery>
        </b-tab-item>

        <b-tab-item
          v-bar="{ useScrollbarPseudo: true }"
          class="make-flex-fit"
          label="Presets"
        >
          <preset-gallery :phrase="phrase"></preset-gallery>
        </b-tab-item>

        <b-tab-item
          v-bar="{ useScrollbarPseudo: true }"
          class="make-flex-fit"
          label="Palettes"
        >
          <palette-gallery :phrase="phrase"></palette-gallery>
        </b-tab-item>

        <b-tab-item class="make-flex-fit" label="Images" disabled> </b-tab-item>

        <b-tab-item class="make-flex-fit" label="Videos" disabled> </b-tab-item>

        <b-tab-item
          v-bar="{ useScrollbarPseudo: true }"
          class="make-flex-fit"
          label="Plugins"
        >
          <plugin-gallery :phrase="phrase"></plugin-gallery>
        </b-tab-item>

        <b-tab-item
          v-bar="{ useScrollbarPseudo: true }"
          class="make-flex-fit"
          label="Projects"
        >
          <project-gallery :phrase="phrase"></project-gallery>
        </b-tab-item>

        <b-tab-item
          v-for="(plugin, pluginName) in enabledPlugins"
          :key="pluginName"
          class="make-flex-fit"
          :label="pluginName"
        >
          <component :is="plugin.plugin.galleryTabComponent.name"></component>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ModuleGallery from '@/components/Gallery/ModuleGallery'
import PaletteGallery from '@/components/Gallery/PaletteGallery'
import PluginGallery from '@/components/Gallery/PluginGallery'
import PresetGallery from '@/components/Gallery/PresetGallery'
import ProjectGallery from '@/components/Gallery/ProjectGallery'
import SearchBar from '@/components/Gallery/SearchBar'

export default {
  name: 'Gallery',
  components: {
    ModuleGallery,
    PaletteGallery,
    PluginGallery,
    PresetGallery,
    ProjectGallery,
    SearchBar
  },
  data() {
    return {
      currentActiveDrag: null,
      phrase: ''
    }
  },
  computed: {
    ...mapGetters('plugins', {
      plugins: 'pluginsWithGalleryTab'
    }),
    enabledPlugins() {
      return Object.keys(this.plugins)
        .filter(pluginName => this.plugins[pluginName].enabled)
        .reduce((obj, pluginName) => {
          obj[pluginName] = this.plugins[pluginName]
          return obj
        }, {})
    }
  },
  methods: {
    menuIconClicked() {
      this.$emit('menuIconClicked')
    }
  }
}
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

    .tabs a {
      color: #fff;
    }

    .tabs li.is-active a {
      border-bottom-color: #ffa600;
      color: #ffa600;
    }

    .tabs a:hover {
      border-bottom-color: #ffa600;
      color: #ffa600;
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
