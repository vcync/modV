<template>
  <div class='search-bar-container' v-shortkey="['esc']" @shortkey="clearSearch">
    <input
      type="text"
      v-model='phrase'
      placeholder="Search Gallery"
      v-shortkey.focus="['ctrl', 'f']"
      @shortkey="focus"
      ref="gallery-search"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import GalleryItem from '@/components/GalleryItem';

  export default {
    name: 'searchBar',
    data() {
      return {
        phrase: ''
      };
    },
    computed: mapGetters({
      modules: 'registeredModules'
    }),
    components: {
      GalleryItem
    },
    methods: {
      focus() {
        // nothing here, but seems to be required for shortkey
      },
      clearSearch() {
        if(this.$refs['gallery-search'] !== document.activeElement) return;
        this.phrase = '';
      }
    },
    watch: {
      phrase() {
        this.$emit('update:phrase', this.phrase);
      }
    }
  };
</script>

<style scoped lang='scss'>
  .search-bar-container {
    width: 100%;
    padding: 5pt;
    box-sizing: border-box;

    input {
      padding: 3px;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
  }
</style>