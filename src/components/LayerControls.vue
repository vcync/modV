<template>
  <div class='pure-u-1-1 control-panel layer-controls' v-if='Layer'>
    <div class='title'><h1>{{ name }}</h1></div>
    <div class='overflow-group'>
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
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';

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
        layers: 'allLayers',
        layerIndex: 'focusedLayerIndex'
      }),
      name() {
        if(!this.Layer) return '';
        if(!('name' in this.Layer)) return '';
        return this.Layer.name;
      }
    },
    methods: {
      ...mapMutations('layers', [
        'setClearing',
        'setInherit',
        'setInheritFrom',
        'setPipeline',
        'setDrawToOutput'
      ])
    },
    watch: {
      name() {
        if(!this.Layer) return;
        const Layer = this.Layer;

        this.clearingChecked = Layer.clearing;
        this.inheritChecked = Layer.inherit;
        this.inheritanceIndex = Layer.inheritFrom;
        this.pipelineChecked = Layer.pipeline;
        this.drawToOutputChecked = Layer.drawToOutput;
      },
      clearingChecked() {
        this.setClearing({
          layerIndex: this.layerIndex,
          clearing: this.clearingChecked
        });
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

<style scoped lang="scss">
  .no-border {
    border: none;
    padding-bottom: 0;
  }

  .control-panel {
    box-sizing: border-box;
    box-shadow: 0px 0px 20px 5px rgba(0,0,0,0.35);
    background-color: #bdbdbd;
    color: #010101;
    border-radius: 4px;
    overflow: hidden;
    display: grid;
    grid-template-rows: 28px auto;
  }

  .control-panel .overflow-group {
    overflow-y: auto;
  }

  .control-panel .title {
    margin: 0;
    padding: 5px;
    background-color: #454545;
    color: #adadad;
  }

  .control-panel .title h1 {
    padding: 0;
    margin: 0;
    font-size: medium;
    font-weight: 400;
    letter-spacing: normal;
  }

  .control-panel label {
    font-size: 12px !important;
    letter-spacing: normal;
    text-align: left !important;
  }

  .control-panel .pure-control-group {
    border-bottom: 1px solid #aaa;
  }

  // .control-panel {
  //   height: 100%;
  // }

  .control-panel .pure-form-aligned .pure-control-group {
    margin: 0;
    padding: .5em 8px;

    &:nth-child(odd) {
      background-color: rgba(221, 221, 221, 0.32);
    }

    &:nth-child(even) {
      background-color: rgba(238, 238, 238, 0.22);
    }
  }
</style>