<template>
  <div id="app">
    <section>
      <div class="top">
        <div class="pure-g">
          <div class="active-list-wrapper"> <!-- pure-u-1-5 -->
            <div data-simplebar-direction="vertical">
              <list></list>
            </div>

            <layer-menu></layer-menu>
          </div>
          <div class="gallery-wrapper"> <!-- pure-u-4-5 -->
            <gallery @menuIconClicked='menuIconClicked'></gallery>
            <resize-handle-left></resize-handle-left>
          </div>
        </div>
      </div>

      <div class="bottom">
        <div class="pure-g">

          <div class="pure-u-1-3" data-simplebar-direction="vertical">
            <div class="control-panel-wrapper pure-g">
              <control-panel></control-panel>
            </div>
          </div>

          <div class="pure-u-1-3 pure-g main-control-area" data-simplebar-direction="vertical">
            <div class="control-panel-wrapper pure-g">
              <layer-controls></layer-controls>
            </div>
          </div>
        </div>
        <resize-handle-top></resize-handle-top>
      </div>

    </section>
    <canvas-preview></canvas-preview>
    <side-menu :menuState='menuOpen'></side-menu>
    <component v-for='pluginComponent in pluginComponents' :is='pluginComponent'></component>
  </div>
</template>

<script>
  import CanvasPreview from '@/components/CanvasPreview';
  import ControlPanel from '@/components/ControlPanel';
  import Gallery from '@/components/Gallery';
  import GlobalControls from '@/components/GlobalControls';
  import LayerControls from '@/components/LayerControls';
  import LayerMenu from '@/components/LayerMenu';
  import List from '@/components/List';
  import SideMenu from '@/components/SideMenu';
  import Tabs from '@/components/Tabs';

  import { modV } from 'modv';

  export default {
    name: 'app',
    data() {
      return {
        menuOpen: false
      };
    },
    computed: {
      pluginComponents() {
        return modV.plugins
          .filter(plugin => 'component' in plugin)
          .map(plugin => plugin.component.name);
      },
    },
    methods: {
      menuIconClicked() {
        this.$data.menuOpen = !this.$data.menuOpen;
      }
    },
    components: {
      CanvasPreview,
      ControlPanel,
      Gallery,
      GlobalControls,
      LayerControls,
      LayerMenu,
      List,
      SideMenu,
      Tabs
    },
  };
</script>

<style>
  body {
    font-family: 'SourceHanSans', sans-serif;
  }

  .active-list-wrapper {
    position: relative;
  }

  .active-list-wrapper > div {
    height: calc(100% - 33px);
  }

  #app {
    background-color: #303030;
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .control-panel-wrapper {
    padding: 10px;
  }

  .gallery-wrapper {
    overflow-y: auto;
  }
</style>