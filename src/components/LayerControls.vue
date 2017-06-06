<template>
  <div class="pure-u-1-1 layer-controls right-controls">
    <h2>{{ name }}</h2>
    <div class="control-group clearing-group">
      <label for="clearingLayers">Clearing</label>
      <input id="clearingLayers" type="checkbox" class="enable" v-model='clearingChecked'>
    </div>
    <div class="control-group inherit-group no-border">
      <label for="inheritLayers">Inherit</label>
      <input id="inheritLayers" type="checkbox" class="enable" v-model='inheritChecked'>
    </div>
    <div class="control-group inherit-group">
      <label for="inheritLayers">Inherit From</label>
      <select id="inheritFromLayers" v-model='inheritanceIndex'>
        <option value="-1">Last Layer</option>
        <option v-for='layer, idx in layers' :value='idx'>
          {{ layer.name }}
        </option>
      </select>
    </div>
    <div class="control-group pipeline-group">
      <label for="pipeLineLayers">Pipline</label>
      <input id="pipeLineLayers" type="checkbox" class="enable" v-model='pipelineChecked'>
    </div>

    <div class="control-group output-group">
      <label for="outputLayers">Draw to output</label>
      <input id="outputLayers" type="checkbox" class="enable" v-model='drawToOutputChecked'>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'layerControls',
    data() {
      return {
        clearingChecked: false,
        inheritChecked: false,
        pipelineChecked: false,
        drawToOutputChecked: false,
        inheritanceIndex: -1
      };
    },
    computed: {
      ...mapGetters('layers', {
        Layer: 'focusedLayer',
        layers: 'allLayers'
      }),
      name() {
        if(!this.Layer) return '';
        if(!('name' in this.Layer)) return '';
        return this.Layer.name;
      }
    },
    methods: {

    },
    watch: {
      name() {
        if(!this.Layer) return;
        const Layer = this.Layer;
        console.log(Layer);

        this.clearingChecked = Layer.clearing;
        this.inheritChecked = Layer.inherit;
        this.inheritanceIndex = Layer.inheritFrom;
        this.pipelineChecked = Layer.pipeline;
        this.drawToOutputChecked = Layer.drawToOutput;
      },
      clearingChecked() {
        this.Layer.clearing = this.clearingChecked;
      },
      inheritChecked() {
        this.Layer.inherit = this.inheritChecked;
      },
      inheritanceIndex() {
        this.Layer.inheritFrom = this.inheritanceIndex;
      },
      pipelineChecked() {
        this.Layer.pipeline = this.pipelineChecked;
      },
      drawToOutputChecked() {
        this.Layer.drawToOutput = this.drawToOutputChecked;
      }
    },
    mounted() {
      if(!this.Layer) return;
      const Layer = this.Layer;
      this.clearingChecked = Layer.clearing;
      this.inheritChecked = Layer.inherit;
      this.inheritanceIndex = Layer.inheritFrom;
      this.pipelineChecked = Layer.pipeline;
      this.drawToOutputChecked = Layer.drawToOutput;
    }
  };
</script>

<style scoped>
  .no-border {
    border: none;
    padding-bottom: 0;
  }
</style>