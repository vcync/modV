<template>
  <div
    class="input-config"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Input Config Panel' }"
  >
    <div v-if="inputConfig">
      <grid class="borders">
        <c span="1.."
          ><div class="title">{{ focusedInputTitle }}</div></c
        >
        <c span="1..">
          <grid columns="4">
            <c span="1">
              Min. Value
            </c>
            <c span="3">
              <Number v-model.number="min" min="-100" max="100" />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1">
              Max. Value
            </c>
            <c span="3">
              <Number v-model.number="max" min="-100" max="100" />
            </c>
          </grid>
        </c>

        <CollapsibleRow :disabled="source && source !== 'meyda'">
          <template v-slot:label>
            Audio
          </template>

          <template v-slot:body>
            <c span="1..">
              <AudioFeatures :input-id="inputConfig.id" />
            </c>
          </template>
        </CollapsibleRow>

        <CollapsibleRow :disabled="source && source !== 'midi'">
          <template v-slot:label>
            MIDI
          </template>

          <template v-slot:body>
            <c span="1..">
              <MIDI :input-id="inputConfig.id" />
            </c>
          </template>
        </CollapsibleRow>

        <CollapsibleRow :disabled="source && source !== 'tween'">
          <template v-slot:label>
            Tween
          </template>

          <template v-slot:body>
            <c span="1..">
              <Tween :input-id="inputConfig.id" />
            </c>
          </template>
        </CollapsibleRow>
      </grid>
    </div>
    <div v-else>
      Select a Module control
    </div>
  </div>
</template>

<script>
import AudioFeatures from "./InputLinkComponents/AudioFeatures";
import MIDI from "./InputLinkComponents/MIDI";
import Tween from "./InputLinkComponents/Tween";
import CollapsibleRow from "./CollapsibleRow";

export default {
  components: {
    AudioFeatures,
    MIDI,
    Tween,
    CollapsibleRow
  },

  data() {
    return {
      iVTitle: "Input Config",
      iVBody:
        "The Input Config panel allows creation of Input Links. Select a Module Control in the Module Inspector, then use the Input Config panel to assign an Audio Feature, MIDI control or Tween to automate the Module Control.",
      value: null
    };
  },

  computed: {
    inputConfig() {
      const { $modV } = this;
      return (
        $modV.store.state.inputs.inputs[
          $modV.store.state.inputs.focusedInput.id
        ] || false
      );
    },

    inputLink() {
      const { $modV } = this;
      return (
        $modV.store.state.inputs.inputLinks[
          $modV.store.state.inputs.focusedInput.id
        ] || false
      );
    },

    source() {
      return (this.inputLink && this.inputLink.source) || false;
    },

    isProp() {
      return "prop" in this.inputConfig;
    },

    focusedInputTitle() {
      return this.$modV.store.state.inputs.focusedInput.title;
    },

    min: {
      get() {
        return this.inputLink ? this.inputLink.min : 0;
      },

      set(value) {
        this.$modV.store.commit("inputs/UPDATE_INPUT_LINK", {
          inputId: this.inputConfig.id,
          key: "min",
          value
        });
      }
    },

    max: {
      get() {
        return this.inputLink ? this.inputLink.max : 0;
      },

      set(value) {
        this.$modV.store.commit("inputs/UPDATE_INPUT_LINK", {
          inputId: this.inputConfig.id,
          key: "max",
          value
        });
      }
    }
  }
};
</script>

<style scoped>
.input-config {
  height: 100%;
  width: 100%;
}

grid.borders > c:not(:last-child):not(:first-child) {
  border-bottom: 1px solid var(--foreground-color-2);
}

.title {
  font-size: 24px;
}
</style>

<style>
.input-config input,
.input-config textarea,
.input-config .select {
  max-width: 120px !important;
}

.input-config .range-control {
  max-width: 240px !important;
}
</style>
