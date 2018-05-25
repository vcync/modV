<template>
  <div id="app">
    <section class="section">
      <div class="top">
        <div class="columns is-gapless is-mobile">
          <div class="column is-3 active-list-wrapper"> <!-- 1-5 -->
            <div v-bar="{ useScrollbarPseudo: true }">
              <list></list>
            </div>

            <layer-menu></layer-menu>
          </div>
          <div class="column gallery-wrapper"> <!-- 4-5 -->
            <gallery @menuIconClicked='menuIconClicked'></gallery>
            <div class="resize-handle-left"></div>
          </div>
        </div>
      </div>

      <div class="bottom" v-bar="{ useScrollbarPseudo: true }">
        <div class="bottom-inner columns is-gapless is-mobile is-multiline">

          <div class="column is-9">
            <div class="control-panel-wrapper columns is-gapless is-mobile module-controls-wrapper">
              <control-panel-handler></control-panel-handler>
            </div>
          </div>

          <div class="column is-3 main-control-area">
            <div class="control-panel-wrapper columns is-gapless is-mobile layer-controls-wrapper">
              <layer-controls></layer-controls>
            </div>
          </div>
        </div>
        <div class="resize-handle-top"></div>
      </div>

    </section>
    <canvas-preview></canvas-preview>
    <side-menu :menuState='menuOpen'></side-menu>
    <status-bar></status-bar>
    <component
      v-for="pluginComponent in pluginComponents"
      :is="pluginComponent"
      :key="pluginComponent"
    ></component>
  </div>
</template>

<script>
  import CanvasPreview from '@/components/CanvasPreview';
  import ControlPanelHandler from '@/components/ControlPanelHandler';
  import Gallery from '@/components/Gallery';
  import GlobalControls from '@/components/GlobalControls';
  import LayerControls from '@/components/LayerControls';
  import LayerMenu from '@/components/LayerMenu';
  import List from '@/components/List';
  import SideMenu from '@/components/SideMenu';
  import StatusBar from '@/components/StatusBar';
  import Tabs from '@/components/Tabs';

  import { mapGetters } from 'vuex';

  export default {
    name: 'app',
    data() {
      return {
        menuOpen: false,
      };
    },
    computed: {
      ...mapGetters('plugins', [
        'enabledPlugins',
      ]),
      pluginComponents() {
        return this.enabledPlugins
          .filter(plugin => 'component' in plugin.plugin)
          .map(plugin => plugin.plugin.component.name);
      },
    },
    methods: {
      menuIconClicked() {
        this.$data.menuOpen = !this.$data.menuOpen;
      },
    },
    components: {
      CanvasPreview,
      ControlPanelHandler,
      Gallery,
      GlobalControls,
      LayerControls,
      LayerMenu,
      List,
      SideMenu,
      StatusBar,
      Tabs,
    },
  };
</script>

<style lang="scss">
  html {
    overflow: hidden;
  }

  .active-list-wrapper {
    position: relative;
  }

  .active-list-wrapper > div {
    height: calc(100% - 38px);
  }

  #app {
    background-color: #303030;
    width: 100vw;
    height: calc(100vh - 35px);
    position: relative;
  }

  .control-panel-wrapper {
    padding: 10px;
  }

  section.section {
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    padding: 0;
  }

  section.section > .columns {
    height: 100%;
  }

  section.section .top {
    height: 75%;
    max-height: calc(100% - 170px);
    min-height: 170px;
  }

  section.section .top > .columns {
    height: 100%;
  }

  section.section .top .active-list {
    min-height: 100%;
    box-sizing: border-box;
    position: relative;
    background-color: hsla(70,8%,4%,1);
  }

  .active-list .gallery-item.sortable-ghost {
    height: 115px;
    width: 100%;
    overflow: hidden;
  }
  .active-list .gallery-item.sortable-ghost canvas {
    height: auto;
    position: relative;
    top: -10%;
  }

  section.section .top .active-list-wrapper {
    min-width: 306px;
  }

  section.section .top .active-list-wrapper,
  .simplebar-content {
    height: 100%;
  }

  .bottom .bottom-inner {
    height: 100%;
    display: flex !important;
  }

  .vb > .vb-dragger {
    // z-index: 5;
    width: 12px;
    right: 0;
    text-align: center;
  }

  .vb > .vb-dragger > .vb-dragger-styler {
    width: 9px;

    transition:
    background-color 100ms ease-out,
    width 100ms ease-out,
    height 100ms ease-out;

    background-color: rgba(255, 166, 0, 0.6);
    border-radius: 20px;
    height: calc(100% - 10px);
    display: inline-block;
  }

  .vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(255, 166, 0, 0.6);
  }

  .vb > .vb-dragger:hover > .vb-dragger-styler {
    background-color: rgba(255, 166, 0, 1);
    width: 12px;
    height: 100%;
  }

  .vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(255, 166, 0, 1);
    width: 12px;
    height: 100%;
  }

  .vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(255, 166, 0, 1);
  }

  .layer-controls-wrapper {
    padding-left: 0;
  }

  .module-controls-wrapper {
    padding-right: 0;
  }
</style>
