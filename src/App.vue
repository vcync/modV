<template>
  <div id="app">
    <section>
      <div class="top">
        <div class="pure-g">
          <div class="active-list-wrapper simplebar"> <!-- pure-u-1-5 -->
            <div class="simplebar-scroll-content">
              <div class=" simplebar-content">
                <list></list>
              </div>
            </div>

            <layer-menu></layer-menu>
          </div>
          <div class="gallery-wrapper simplebar"> <!-- pure-u-4-5 -->
            <div class="simplebar-scroll-content">
              <div class=" simplebar-content">
                <gallery></gallery>
              </div>
            </div>
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
            <div class="right-controls-panels"  data-simplebar-direction="vertical">
              <div class="pure-u-1-1 layer-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
              <div class="pure-u-1-1 global-control-panel-wrapper control-panel-wrapper pure-g">
                <global-controls></global-controls>
              </div>
              <div class="pure-u-1-1 preset-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
            </div>
          </div>

          <div class="canvas-preview pure-u-1-3">
            <output-window-button></output-window-button>
            <canvas id="preview-canvas"></canvas>
          </div>

        </div>
        <resize-handle-top></resize-handle-top>
      </div>

    </section>
  </div>
</template>

<script>
  import ControlPanel from '@/components/ControlPanel';
  import Gallery from '@/components/Gallery';
  import GlobalControls from '@/components/GlobalControls';
  import LayerMenu from '@/components/LayerMenu';
  import List from '@/components/List';
  import OutputWindowButton from '@/components/OutputWindowButton';

  export default {
    name: 'app',
    components: {
      ControlPanel,
      Gallery,
      GlobalControls,
      LayerMenu,
      List,
      OutputWindowButton
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
</style>