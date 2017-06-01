<template>
  <div class="icon add-layer" @click='addLayer' title="Create New Layer">
    <span class="ibvf"></span>
    <i class="fa fa-plus" aria-hidden="true"></i>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'addLayerButton',
    methods: {
      ...mapActions('layers', [
        'addLayer'
      ])
    }
  };
</script>

<style scoped>

</style>