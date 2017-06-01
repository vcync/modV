<template>
  <div class="icon trash-layer" @click='removeFocusedLayer' title="Remove Focused Layer">
    <span class="ibvf"></span>
      <i class="fa fa-trash" aria-hidden="true"></i>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'removeLayerButton',
    methods: {
      ...mapActions('layers', [
        'removeFocusedLayer'
      ])
    }
  };
</script>

<style scoped>

</style>