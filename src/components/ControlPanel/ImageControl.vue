<template>
  <div class="image-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <dropdown
      :data="layerNames"
      :width='129'
      :cbChanged="layerChanged"
      :class="{'profile-selector': true}"
    ></dropdown>
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
        currentLayerIndex: undefined,
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
          value: undefined,
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
    },
    methods: {
      layerChanged(e) {
        this.currentLayerIndex = e[0].value;
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
