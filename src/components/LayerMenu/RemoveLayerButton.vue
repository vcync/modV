<template>
  <!-- <div class="icon trash-layer" @click='removeFocusedLayer' title="Remove Focused Layer">
    <span class="ibvf"></span>
      <i class="fa fa-trash" aria-hidden="true"></i>
  </div> -->
  <button class="button is-primary is-small" @click="removeFocusedLayer" title="Remove Focused Layer">
    <b-icon icon="trash"></b-icon>
  </button>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'removeLayerButton',
    methods: {
      ...mapActions('layers', [
        'removeFocusedLayer',
      ]),
    },
  };
</script>

<style scoped>

</style>
