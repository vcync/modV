<template>
  <div class="status-bar tags">
    <span class="tag" @dblclick="sizeModalOpen = true">{{ sizeOut }}</span>
    <span class="tag">layers: {{ allLayers.length }}</span>
    <span class="tag">modules: {{ nonGalleryModules }}</span>
    <span class="tag">bpm: {{ bpm }} {{ detect ? '🤖' : '' }}</span>

    <project-item></project-item>

    <b-modal :active.sync="sizeModalOpen">
      <div>
        <b-input
          type="number"
          v-model.number="width"
        />
        𝗑
        <b-input
          type="number"
          v-model.number="height"
        />
        <button class="button" @click="setWindowSize">Set window size</button>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import projectItem from './Project';

  export default {
    name: 'statusBar',
    components: {
      projectItem,
    },
    data() {
      return {
        sizeModalOpen: false,
        width: 0,
        height: 0,
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
      ...mapGetters('windows', [
        'largestWindowSize',
        'largestWindowReference',
      ]),
      activeModules() {
        return this.$store.state.modVModules.active;
      },
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
      setWindowSize() {
        this.resizeWindow(this.largestWindowReference(), this.width, this.height);
      },
      resizeWindow(window, width, height) {
        if (window.outerWidth) {
          window.resizeTo(
            width + (window.outerWidth - window.innerWidth),
            height + (window.outerHeight - window.innerHeight),
          );
        } else {
          window.resizeTo(500, 500);
          window.resizeTo(
            width + (500 - document.body.offsetWidth),
            height + (500 - document.body.offsetHeight),
          );
        }
      },
    },
    watch: {
      largestWindowSize(value) {
        this.width = value.width;
        this.height = value.height;
      },
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
