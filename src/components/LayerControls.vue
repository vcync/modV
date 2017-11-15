<template>
  <div class="column control-panel layer-controls" v-show="Layer">
    <div class="title"><h1>{{ name }}</h1></div>
    <div class="overflow-group" v-bar>
      <div>
        <div class="control-group clearing-group">
          <b-field label="Clearing">
            <b-checkbox v-model="clearingChecked" />
          </b-field>
        </div>
        <div class="control-group inherit-group no-border">
          <b-field label="Inherit">
            <b-checkbox v-model="inheritChecked" />
          </b-field>
        </div>
        <div class="control-group inherit-group">
          <b-field label="Inherit From">
            <b-dropdown class="dropdown" v-model="inheritanceIndex">
              <button class="button is-primary is-small" slot="trigger">
                <span>{{ inheritedLayerName | capitalize }}</span>
                <b-icon icon="angle-down"></b-icon>
              </button>

              <b-dropdown-item :value="-1">Last Layer</b-dropdown-item>
              <b-dropdown-item
                v-for="layer, idx in layers"
                :key="idx"
                :value="idx"
              >{{ layer.name }}</b-dropdown-item>

            </b-dropdown>
          </b-field>
        </div>
        <div class="control-group pipeline-group">
          <b-field label="Pipeline">
            <b-checkbox v-model="pipelineChecked" />
          </b-field>
        </div>

        <div class="control-group output-group">
          <b-field label="Draw to output">
            <b-checkbox v-model="drawToOutputChecked" />
          </b-field>
        </div>
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
        inheritanceIndex: -1,
      };
    },
    computed: {
      ...mapGetters('layers', {
        Layer: 'focusedLayer',
        layers: 'allLayers',
        layerIndex: 'focusedLayerIndex',
      }),
      name() {
        if (!this.Layer) return '';
        if (!('name' in this.Layer)) return '';
        return this.Layer.name;
      },
      inheritedLayerName() {
        if (this.inheritanceIndex < 0) {
          return 'Last Layer';
        }

        return this.layers[this.inheritanceIndex].name;
      },
    },
    methods: {
      ...mapMutations('layers', [
        'setClearing',
        'setInherit',
        'setInheritFrom',
        'setPipeline',
        'setDrawToOutput',
      ]),
      updateChecked() {
        const Layer = this.Layer;

        this.clearingChecked = Layer.clearing;
        this.inheritChecked = Layer.inherit;
        this.inheritanceIndex = Layer.inheritFrom;
        this.pipelineChecked = Layer.pipeline;
        this.drawToOutputChecked = Layer.drawToOutput;
      },
    },
    watch: {
      Layer: {
        handler() {
          if (!this.Layer) return;
          this.updateChecked();
        },
        deep: true,
      },
      clearingChecked() {
        this.setClearing({
          layerIndex: this.layerIndex,
          clearing: this.clearingChecked,
        });
      },
      inheritChecked() {
        this.setInherit({
          layerIndex: this.layerIndex,
          inherit: this.inheritChecked,
        });
      },
      inheritanceIndex() {
        this.setInheritFrom({
          layerIndex: this.layerIndex,
          inheritFrom: this.inheritanceIndex,
        });
      },
      pipelineChecked() {
        this.setPipeline({
          layerIndex: this.layerIndex,
          pipeline: this.pipelineChecked,
        });
      },
      drawToOutputChecked() {
        this.setDrawToOutput({
          layerIndex: this.layerIndex,
          drawToOutput: this.drawToOutputChecked,
        });
      },
    },
    mounted() {
      if (!this.Layer) return;

      this.updateChecked();
    },
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
