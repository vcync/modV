<template>
  <div v-show="Layer" class="column control-panel is-12 layer-controls">
    <article class="message">
      <div class="message-header">
        <p>{{ name }}</p>
        <!-- <button class="delete" :class="{ pinned }" @click="pin" :title="pinTitle">
          <b-icon icon="thumb-tack" size="is-small" />
        </button> -->
      </div>
      <div v-bar="{ useScrollbarPseudo: true }" class="message-body">
        <div v-bar class="overflow-group">
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
                <b-select v-model="inheritanceIndex" class="dropdown">
                  <option :value="-1">Last Layer</option>
                  <option
                    v-for="(layer, idx) in layers"
                    :key="idx"
                    :value="idx"
                    >{{ layer.name }}</option
                  >
                </b-select>
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

            <div class="control-group output-group">
              <b-field label="Draw to window">
                <b-select
                  v-model="drawToWindowId"
                  placeholder="Select a window"
                >
                  <option value="-1" selected="selected">All windows</option>
                  <option
                    v-for="(option, index) in windowIds"
                    :key="option"
                    :value="option"
                  >
                    {{ index }}
                  </option>
                </b-select>
              </b-field>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "LayerControls",
  data() {
    return {
      clearingChecked: false,
      inheritChecked: false,
      pipelineChecked: false,
      drawToOutputChecked: false,
      inheritanceIndex: -1,
      drawToWindowId: null
    };
  },
  computed: {
    ...mapGetters("layers", {
      Layer: "focusedLayer",
      layers: "allLayers",
      layerIndex: "focusedLayerIndex"
    }),
    ...mapGetters("windows", ["windowIds"]),
    name() {
      if (!this.Layer) return "";
      if (!("name" in this.Layer)) return "";
      return this.Layer.name;
    },
    inheritedLayerName() {
      if (this.inheritanceIndex < 0) {
        return "Last Layer";
      }

      return this.layers[this.inheritanceIndex || 0].name;
    }
  },
  watch: {
    Layer: {
      handler() {
        if (!this.Layer) return;
        this.updateChecked();
      },
      deep: true
    },
    clearingChecked() {
      this.setClearing({
        layerIndex: this.layerIndex,
        clearing: this.clearingChecked
      });
    },
    inheritChecked() {
      this.setInherit({
        layerIndex: this.layerIndex,
        inherit: this.inheritChecked
      });
    },
    inheritanceIndex() {
      this.setInheritFrom({
        layerIndex: this.layerIndex,
        inheritFrom: this.inheritanceIndex
      });
    },
    pipelineChecked() {
      this.setPipeline({
        layerIndex: this.layerIndex,
        pipeline: this.pipelineChecked
      });
    },
    drawToOutputChecked() {
      this.setDrawToOutput({
        layerIndex: this.layerIndex,
        drawToOutput: this.drawToOutputChecked
      });
    },
    drawToWindowId(value) {
      let commitValue = value;

      if (value === "-1") commitValue = null;

      this.setDrawToWindow({
        layerIndex: this.layerIndex,
        windowId: commitValue
      });
    }
  },
  mounted() {
    if (!this.Layer) return;

    this.updateChecked();
  },
  methods: {
    ...mapMutations("layers", [
      "setClearing",
      "setInherit",
      "setInheritFrom",
      "setPipeline",
      "setDrawToOutput",
      "setDrawToWindow"
    ]),
    updateChecked() {
      const Layer = this.Layer;

      this.clearingChecked = Layer.clearing;
      this.inheritChecked = Layer.inherit;
      this.inheritanceIndex = Layer.inheritFrom;
      this.pipelineChecked = Layer.pipeline;
      this.drawToOutputChecked = Layer.drawToOutput;
      this.drawToWindowId = Layer.drawToWindowId;
    }
  }
};
</script>

<style lang="scss"></style>
