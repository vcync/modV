<template>
  <Container
    @drop="onDrop"
    drag-handle-selector=".layer-handle"
    lock-axis="y"
    group-name="layers"
    :should-animate-drop="() => false"
    tag="div"
    class="left-topactive-list columns is-gapless is-multiline"
  >
    <Draggable
      v-for="(layer, index) in layers"
      :key="index"
      class="column is-12"
    >
      <layer
        :Layer="layer"
        :LayerIndex="index"
      ></layer>
    </Draggable>
  </Container>
</template>

<script>
  import { mapActions, mapMutations, mapGetters } from 'vuex';
  import LayerComponent from '@/components/Layer';
  import { Container, Draggable } from 'vue-smooth-dnd';

  const applyDrag = (arr, dragResult) => {
    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) return arr;

    const result = [...arr];
    let itemToAdd = payload;

    if (removedIndex !== null) {
      itemToAdd = result.splice(removedIndex, 1)[0];
    }

    if (addedIndex !== null) {
      result.splice(addedIndex, 0, itemToAdd);
    }

    return result;
  };

  export default {
    name: 'list',
    components: {
      Draggable,
      Container,
      Layer: LayerComponent,
    },
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
    methods: {
      ...mapActions('layers', [
        'addLayer',
      ]),
      ...mapMutations('layers', [
        'updateLayers',
      ]),
      onDrop(e) {
        this.layers = applyDrag(this.layers, e);
      },
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
