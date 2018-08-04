<template>
  <draggable
    :options="dragOptions"
    v-model="layers"
  >
    <transition-group
      name="list"
      tag="div"
      class="left-topactive-list columns is-gapless is-multiline"
    >
      <layer
        v-for="(layer, index) in layers"
        :Layer="layer"
        :LayerIndex="index"
        :key="index"
      ></layer>
    </transition-group>
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

<style>
  .module-list .column.is-3.sortable-chosen.sortable-ghost {
    width: 100%;
  }
</style>
