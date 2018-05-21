<template>
  <div class="layer-menu">
    <add-layer-button></add-layer-button>
    <remove-layer-button></remove-layer-button>
  </div>
</template>

<script>
  import AddLayerButton from './AddLayerButton';
  import RemoveLayerButton from './RemoveLayerButton';

  export default {
    name: 'layerMenu',
    components: {
      AddLayerButton,
      RemoveLayerButton,
    },
  };
</script>

<style scoped lang='scss'>
  .layer-menu {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 38px;
    background-color: #383838;
    padding: 5px;
    box-sizing: border-box;
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    // z-index: 101;
  }
</style>
