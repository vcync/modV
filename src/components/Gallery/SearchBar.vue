<template>
  <div
    v-shortkey="['esc']"
    class="search-bar-container"
    @shortkey="clearSearch"
  >
    <!-- <input
      type="text"
      v-model='phrase'
      placeholder="Search Gallery"
      v-shortkey.focus="['ctrl', 'f']"
      @shortkey="focus"
      ref="gallery-search"
    /> -->
    <b-input
      id="gallery-search"
      ref="gallery-search"
      v-model="phrase"
      v-shortkey.focus="['ctrl', 'f']"
      icon="search"
      type="text"
      placeholder="Search Gallery"
      @shortkey="focus"
    ></b-input>
    <i class="fa fa-bars fa-2x" aria-hidden="true" @click="menuIconClicked"></i>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SearchBar',
  data() {
    return {
      phrase: ''
    }
  },
  computed: mapGetters({
    modules: 'registeredModules'
  }),
  watch: {
    phrase() {
      this.$emit('update:phrase', this.phrase)
    }
  },
  methods: {
    focus() {
      // nothing here, but seems to be required for shortkey
    },
    clearSearch() {
      if (this.$refs['gallery-search'] !== document.activeElement) return
      this.phrase = ''
    },
    menuIconClicked() {
      this.$emit('menuIconClicked')
    }
  }
}
</script>

<style scoped lang="scss">
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
