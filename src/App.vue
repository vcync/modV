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
            <gallery></gallery>
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

          <div class="pure-u-1-3 pure-g main-control-area">
            <tabs :titles="['Layer', 'Global', 'Preset']">
              <div slot="tab-1" class="pure-u-1-1 layer-control-panel-wrapper control-panel-wrapper pure-g">
                <layer-controls></layer-controls>
              </div>
              <div slot="tab-2" class="pure-u-1-1 global-control-panel-wrapper control-panel-wrapper pure-g">
                <global-controls></global-controls>
              </div>
              <div slot="tab-3" class="pure-u-1-1 preset-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
            </tabs>
          </div>

          <div class="canvas-preview pure-u-1-3">
            <output-window-button></output-window-button>
            <canvas id="preview-canvas"></canvas>
          </div>

        </div>
        <resize-handle-top></resize-handle-top>
      </div>

    </section>
    <context-menu v-for='menu in activeMenus' :options='menu'></context-menu>
    <expression></expression>
  </div>
</template>

<script>
  import ControlPanel from '@/components/ControlPanel';
  import Gallery from '@/components/Gallery';
  import GlobalControls from '@/components/GlobalControls';
  import LayerControls from '@/components/LayerControls';
  import LayerMenu from '@/components/LayerMenu';
  import List from '@/components/List';
  import OutputWindowButton from '@/components/OutputWindowButton';
  import Tabs from '@/components/Tabs';

  import { mapGetters } from 'vuex';

  export default {
    name: 'app',
    computed: {
      ...mapGetters('contextMenu', [
        'activeMenus'
      ]),
    },
    components: {
      ControlPanel,
      Gallery,
      GlobalControls,
      LayerControls,
      LayerMenu,
      List,
      OutputWindowButton,
      Tabs
    },
  };
</script>

<style>
  body {
    font-family: sans-serif;
  }

  .active-list-wrapper {
    position: relative;
  }

  .active-list-wrapper > div {
    height: calc(100% - 33px);
  }
</style>