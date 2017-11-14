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
            <resize-handle-left></resize-handle-left>
          </div>
        </div>
      </div>

      <div class="bottom">
        <div class="columns is-gapless is-mobile">

          <div class="column is-3">
            <div class="control-panel-wrapper columns is-gapless is-mobile">
              <control-panel></control-panel>
            </div>
          </div>

          <div class="column is-3 main-control-area">
            <div class="control-panel-wrapper columns is-gapless is-mobile">
              <layer-controls></layer-controls>
            </div>
          </div>
        </div>
        <resize-handle-top></resize-handle-top>
      </div>

    </section>
    <canvas-preview></canvas-preview>
    <side-menu :menuState='menuOpen'></side-menu>
    <component
      v-for="pluginComponent in pluginComponents"
      :is="pluginComponent"
      :key="pluginComponent"
    ></component>
    <notifications group="custom-template" position="top center">
      <template slot="body" scope="props">
        <b-message :title="props.item.title" type="is-danger" has-icon closable @close="props.close">
          {{ props.item.text }}
        </b-message>
      </template>
    </notifications>
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
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .control-panel-wrapper {
    padding: 10px;
  }

  section.section {
    height: 100%;
    position: fixed;
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
  section.section .top .active-list-wrapper:before {
    position: absolute;
    top: 50%;
    width: 100%;
    height: auto;
    text-align: center;
    font-size: 2em;
    color: rgba(210, 210, 210, 0.8);
    text-shadow: 1px 4px 6px #fff, 0 0 0 #000, 1px 4px 6px #fff;
    opacity: 0.7;
    pointer-events: none;
    content: 'Drag Modules Here';
  }

  section.section .top .active-list-wrapper {
    min-width: 306px;
  }

  section.section .top .active-list-wrapper,
  .simplebar-content {
    height: 100%;
  }

  .bottom > div {
    height: 100%;
  }

  .vb > .vb-dragger {
      z-index: 5;
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
</style>
