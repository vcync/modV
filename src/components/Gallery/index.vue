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
  import { mapActions, mapGetters, mapMutations } from 'vuex';
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
      ...mapActions('modVModules', [
        'removeActiveModule'
      ]),
      ...mapMutations('modVModules', [
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
    align-content: stretch;
    align-items: center;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    justify-items: start;
    width: 100%;
  }

  .gallery {
    background-color: #383838;
    box-sizing: border-box;
    height: 100%;
    min-width: 600px;
    overflow: hidden;
    padding: 5pt;
  }
</style>