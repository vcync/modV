<template>
  <div class="right-top gallery pure-g" @drop='drop' @dragover='dragover'>
    <search-bar :phrase.sync='phrase'></search-bar>
    <draggable
      class='gallery-items'
      :options="{ group: { name: 'modules',  pull: 'clone', put: false }, sort: false }"
    >
      <gallery-item
        v-for='(module, key) in modules'
        :ModuleIn='module'
        :moduleName='key'
        :key='key'
        :class="{ hidden: !search(key, phrase) }"
      ></gallery-item>
    </draggable>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  // import { forIn } from '@/modv/utils';
  import SearchBar from '@/components/Gallery/SearchBar';
  import GalleryItem from '@/components/GalleryItem';
  import draggable from 'vuedraggable';

  export default {
    name: 'gallery',
    data() {
      return {
        currentActiveDrag: null,
        phrase: ''
      };
    },
    computed: mapGetters('modVModules', {
      currentDragged: 'currentDragged',
      modules: 'registry'
    }),
    methods: {
      ...mapMutations('modVModules', [
        'removeActiveModule',
        'setCurrentDragged'
      ]),
      ...mapMutations('layers', [
        'removeModuleFromLayer'
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
        if(!this.currentDragged) return;
        const draggedNode = document.querySelectorAll(`.active-item[data-module-name="${this.currentDragged}"]`)[1];
        draggedNode.classList.add('deletable');
      },
      dragleave(e) {
        console.log('leave gallery');
        e.preventDefault();
        if(!this.currentDragged) return;
        const draggedNode = document.querySelectorAll(`.active-item[data-module-name="${this.currentDragged}"]`)[1];
        draggedNode.classList.remove('deletable');
      }
    },
    components: {
      draggable,
      GalleryItem,
      SearchBar
    }
  };
</script>

<style scoped lang='scss'>
  .hidden {
    display: none;
  }

  .gallery-items {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    justify-items: start;
    align-items: center;
    align-content: stretch;
    width: 100%;
    box-sizing: border-box;
  }
</style>