<template>
  <div class="left-top active-list pure-g">
    <layer
      v-for='(layer, index) in layers'
      :Layer='layer'
      :LayerIndex='index'
      :key='index'
    ></layer>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import LayerComponent from '@/components/Layer';

  export default {
    name: 'list',
    computed: mapGetters('layers', {
      layers: 'allLayers',
      focusedLayer: 'focusedLayer'
    }),
    components: {
      Layer: LayerComponent
    },
    methods: {
      ...mapActions('layers', [
        'addLayer'
      ])
    },
    created() {
      this.addLayer().then((layer) => {
        this.Layer = layer;
      });
    }
  };
</script>

<style scoped>

</style>
