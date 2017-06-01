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

<style scoped>

</style>