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
      RemoveLayerButton
    }
  };
</script>

<style scoped>

</style>