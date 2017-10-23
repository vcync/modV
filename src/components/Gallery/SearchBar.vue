<template>
  <div class='search-bar-container' v-shortkey="['esc']" @shortkey="clearSearch">
    <!-- <input
      type="text"
      v-model='phrase'
      placeholder="Search Gallery"
      v-shortkey.focus="['ctrl', 'f']"
      @shortkey="focus"
      ref="gallery-search"
    /> -->
    <b-input
      icon="search"
      type="text"
      v-model="phrase"
      placeholder="Search Gallery"
      v-shortkey.focus="['ctrl', 'f']"
      @shortkey="focus"
      ref="gallery-search"
      id="gallery-search"
    ></b-input>
    <i class="fa fa-bars fa-2x" aria-hidden="true" @click='menuIconClicked'></i>
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
      },
      menuIconClicked() {
        this.$emit('menuIconClicked');
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

    .control {
      display: inline-block;
      width: 90%;
    }

    i {
      color: #fff;
      vertical-align: top;
      margin: -2px 0 0 0;
      cursor: pointer;
    }
  }
</style>
