<template>
  <div class='canvas-preview'>
    <output-window-button></output-window-button>
    <canvas id='preview-canvas'></canvas>
  </div>
</template>

<script>
  import OutputWindowButton from '@/components/OutputWindowButton';

  export default {
    name: 'canvas-preview',
    components: {
      OutputWindowButton
    }
  };
</script>

<style>
  .canvas-preview {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 0;
    margin: 0;
    font-size: 0;
    overflow: auto;
    border-radius: 4px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.24);
    resize: both;
  }
</style>