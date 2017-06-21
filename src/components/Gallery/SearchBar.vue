<template>
  <div class='search-bar-container'>
    <input type="text" v-model='phrase' @input='syncPhrase' placeholder="Search Gallery" />
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
      syncPhrase() {
        this.$emit('update:phrase', this.phrase);
      }
    }
  };
</script>

<style scoped lang='scss'>
  .search-bar-container {
    width: 100%;
    padding: 5pt;

    input {
      padding: 3px;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
  }
</style>