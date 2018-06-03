<template>
  <div class="status-bar tags">
    <span class="tag">{{ sizeOut }}</span>
    <span class="tag">layers: {{ allLayers.length }}</span>
    <span class="tag">modules: {{ nonGalleryModules }}</span>
    <span class="tag">bpm: {{ bpm }} {{ detect ? '🤖' : '' }}</span>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'statusBar',
    data() {
      return {

      };
    },
    computed: {
      ...mapGetters('tempo', [
        'bpm',
        'detect',
      ]),
      ...mapGetters('layers', [
        'allLayers',
      ]),
      ...mapGetters('modVModules', [
        'activeModules',
      ]),
      ...mapGetters('windows', [
        'largestWindowSize',
      ]),
      sizeOut() {
        return `${this.largestWindowSize.width}𝗑${this.largestWindowSize.height}px`;
      },
      nonGalleryModules() {
        return Object
          .keys(this.activeModules)
          .filter(moduleName => moduleName.indexOf('-gallery') < 0)
          .length;
      },
    },
    methods: {

    },
    components: {

    },
  };
</script>

<style lang="scss">
  .status-bar {
    position: absolute;
    bottom: -35px;
    left: 0;
    right: 0;
    padding-left: 0.5rem;

    background-color: #c1c1c1;
    height: 35px;

    &.tags {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 0;
      }

      .tag {
        margin-bottom: 0;
      }
    }
  }
</style>
