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
            <div class="control-panel-wrapper pure-g"></div>
          </div>

          <div class="pure-u-1-3 pure-g main-control-area">
            <div class="right-controls-panels"  data-simplebar-direction="vertical">
              <div class="pure-u-1-1 layer-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
              <div class="pure-u-1-1 global-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
              <div class="pure-u-1-1 preset-control-panel-wrapper control-panel-wrapper pure-g">

              </div>
            </div>
          </div>

          <div class="canvas-preview pure-u-1-3">
            <div class="canvas-preview-output">
              <i class="fa fa-external-link"></i>
              <span class="canvas-preview-output-text">Output Window</span>
            </div>
            <canvas id="preview-canvas"></canvas>
          </div>

        </div>
        <resize-handle-top></resize-handle-top>
      </div>

    </section>
  </div>
</template>

<script>
  import Gallery from '@/components/Gallery';
  import LayerMenu from '@/components/LayerMenu';
  import List from '@/components/List';

  export default {
    name: 'app',
    components: {
      Gallery,
      LayerMenu,
      List
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