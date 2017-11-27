<template>
  <div class="image-control" :data-moduleName="moduleName">
    <label :for="inputId">
      {{ label }}
    </label>

    <b-dropdown class="dropdown" v-model="currentLayerIndex" :id="inputId">
    <button class="button is-primary is-small" slot="trigger">
      <span>{{ selectedLabel | capitalize }}</span>
      <b-icon icon="angle-down"></b-icon>
    </button>

    <b-dropdown-item
      v-for="data, idx in layerNames"
      :key="idx"
      :value="data.value"
    >{{ data.label | capitalize }}</b-dropdown-item>
  </b-dropdown>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'imageControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        currentLayerIndex: -1,
      };
    },
    computed: {
      ...mapGetters('layers', {
        layers: 'allLayers',
      }),
      layerNames() {
        const data = [];
        const allLayers = this.layers;

        if (allLayers.length < 1) return data;

        data.push({
          label: 'Inherit',
          value: -1,
          selected: typeof this.currentLayerIndex === 'undefined',
        });

        allLayers.forEach((Layer, idx) => {
          const name = Layer.name;
          data.push({
            label: name,
            value: idx,
            selected: this.currentLayerIndex === idx,
          });
        });

        return data;
      },
      value() {
        if (!this.currentLayer) return undefined;
        return this.currentLayer.canvas;
      },
      currentLayer() {
        return this.layers[this.currentLayerIndex];
      },
      moduleName() {
        return this.module.info.name;
      },
      variable() {
        return this.control.variable;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      label() {
        return this.control.label;
      },
      selectedLabel() {
        return this.currentLayerIndex < 0 ? 'Inherit' : this.layers[this.currentLayerIndex].name;
      },
    },
    watch: {
      value() {
        this.module[this.variable] = this.value;
      },
    },
    mounted() {
      this.module[this.variable] = this.value;
    },
  };
</script>

<style scoped>
  .profile-selector-container {
    display: inline-block;
  }

  .profile-selector.hsy-dropdown {
      display: inline-block;
      vertical-align: middle;

    & > .selected {
      // height: 28px !important;
      // line-height: 28px !important;

      font-family: inherit;
      /* font-size: 100%; */
      padding: .5em 22px .5em 1em;
      color: #444;
      color: rgba(0,0,0,.8);
      border: 1px solid #999;
      border: 0 rgba(0,0,0,0);
      background-color: #E6E6E6;
      text-decoration: none;
      border-radius: 2px;
    }
  }
</style>
