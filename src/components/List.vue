<template>
  <draggable
    :options="dragOptions"
    v-model="layers"
    class="left-top active-list columns is-gapless"
  >
    <layer
      v-for="(layer, index) in layers"
      :Layer="layer"
      :LayerIndex="index"
      :key="index"
    ></layer>
  </draggable>
</template>

<script>
  import { mapActions, mapMutations, mapGetters } from 'vuex';
  import LayerComponent from '@/components/Layer';
  import draggable from 'vuedraggable';

  export default {
    name: 'list',
    data() {
      return {
        dragOptions: {
          group: {
            name: 'layers',
            pull: true,
            put: true,
          },
          handle: '.handle',
          chosenClass: 'chosen',
        },
      };
    },
    computed: {
      ...mapGetters('layers', {
        allLayers: 'allLayers',
        focusedLayer: 'focusedLayer',
      }),
      layers: {
        get() {
          return this.allLayers;
        },
        set(value) {
          this.updateLayers({ layers: value });
        },
      },
    },
    components: {
      draggable,
      Layer: LayerComponent,
    },
    methods: {
      ...mapActions('layers', [
        'addLayer',
      ]),
      ...mapMutations('layers', [
        'updateLayers',
      ]),
    },
    created() {
      this.addLayer().then(({ Layer }) => {
        this.Layer = Layer;
      });
    },
  };
</script>

<style scoped>

</style>
