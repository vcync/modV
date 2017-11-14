<template>
  <div class="right-top gallery pure-g" @drop='drop' @dragover='dragover'>
    <search-bar
      :phrase.sync='phrase'
      class='search-bar-wrapper'
      @menuIconClicked='menuIconClicked'
    ></search-bar>
      <div class='gallery-items-wrapper' v-bar="{ useScrollbarPseudo: true }">
        <div>
          <div class='pure-u-1-1 title' :class="{ hidden: phrase.length < 1 }">
            <h2>All Modules</h2>
          </div>
          <draggable
            class='gallery-items'
            :class="{ hidden: phrase.length < 1 }"
            :options="{ group: { name: 'modules',  pull: 'clone', put: false }, sort: false }"
          >
            <gallery-item
              v-for="(module, key) in modules"
              :ModuleIn='module'
              :moduleName='key'
              :key='key'
              :class="{ hidden: !search(key, phrase) }"
            ></gallery-item>
          </draggable>

          <div class='pure-u-1-1 title' :class="{ hidden: phrase.length > 0 }">
            <h2>Module 2D</h2>
          </div>
          <draggable
            class='gallery-items'
            :class="{ hidden: phrase.length > 0 }"
            :options="{ group: { name: 'modules',  pull: 'clone', put: false }, sort: false }"
          >
            <gallery-item
              v-for="(module, key) in module2d"
              :ModuleIn='module'
              :moduleName='key'
              :key='key'
            ></gallery-item>
          </draggable>

          <div class='pure-u-1-1 title' :class="{ hidden: phrase.length > 0 || moduleShader.length < 1 }">
            <h2>Module Shader</h2>
          </div>
          <draggable
            class='gallery-items'
            :class="{ hidden: phrase.length > 0 || moduleShader.length < 1 }"
            :options="{ group: { name: 'modules',  pull: 'clone', put: false }, sort: false }"
          >
            <gallery-item
              v-for='(module, key) in moduleShader'
              :ModuleIn='module'
              :moduleName='key'
              :key='key'
            ></gallery-item>
          </draggable>

          <div class='pure-u-1-1 title' :class="{ hidden: phrase.length > 0 }">
            <h2>Module ISF</h2>
          </div>
          <draggable
            class='gallery-items'
            :class="{ hidden: phrase.length > 0 }"
            :options="{ group: { name: 'modules',  pull: 'clone', put: false }, sort: false }"
          >
            <gallery-item
              v-for='(module, key) in moduleISF'
              :ModuleIn='module'
              :moduleName='key'
              :key='key'
            ></gallery-item>
          </draggable>
        </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { Module2D, ModuleShader, ModuleISF } from '@/modv';
  import SearchBar from '@/components/Gallery/SearchBar';
  import GalleryItem from '@/components/GalleryItem';
  import draggable from 'vuedraggable';

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
      moduleShader() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof ModuleShader)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
      module2d() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof Module2D)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
      moduleISF() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof ModuleISF)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
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
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
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
      menuIconClicked() {
        this.$emit('menuIconClicked');
      },
    },
    components: {
      draggable,
      GalleryItem,
      SearchBar,
    },
  };
</script>

<style scoped lang='scss'>
  .gallery-items-wrapper {
    flex: 1 1 auto;
    height: 100%;
  }

  .gallery-items {
    align-content: stretch;
    align-items: center;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    justify-items: start;
    width: 100%;
  }

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

  .title h2 {
    color: #fff;
    cursor: default;
    font-weight: normal;
    margin: 0.82em 5pt 0.2em 5pt;
  }

  .hidden {
    display: none;
  }
</style>
