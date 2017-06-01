<template>
  <div class="right-top gallery pure-g">
    <search-bar :phrase.sync='phrase'></search-bar>
    <div class='gallery-items'>
      <gallery-item
        v-for='(module, key) in modules'
        :ModuleIn='module'
        :key='key'
        :class="{ hidden: !search(key, phrase) }"
      ></gallery-item>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  // import { forIn } from '@/modv/utils';
  import SearchBar from '@/components/Gallery/SearchBar';
  import GalleryItem from '@/components/GalleryItem';

  export default {
    name: 'gallery',
    data() {
      return {
        currentActiveDrag: null,
        phrase: ''
      };
    },
    computed: mapGetters('modVModules', {
      modules: 'registeredModules'
    }),
    methods: {
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
      drop(e) {
        // Remove activeModule
        e.preventDefault();
        // const droppedModuleData = e.dataTransfer.getData('module-name');

        this.currentActiveDrag = null;

        // forIn(this.activeModules, (moduleName, Module) => {
        //   if(Module.info.safeName === droppedModuleData) {
        //     self.deleteActiveModule(Module);
        //   }
        // });
      },
      dragover(e) {
        // Drag activeModule over gallery
        e.preventDefault();
        if(!this.currentActiveDrag) return;

        this.currentActiveDrag.classList.add('deletable');
      },
      dragleave(e) {
        // Drag activeModule out of gallery
        e.preventDefault();
        if(!this.currentActiveDrag) return;

        this.currentActiveDrag.classList.remove('deletable');
      }
    },
    components: {
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