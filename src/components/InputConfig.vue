<template>
  <div
    class="input-config"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Input Config Panel' }"
  >
    <div v-if="inputConfig">
      <grid class="borders">
        <c span="1.."
          ><h3>{{ focusedInputTitle }}</h3></c
        >
        <c span="1..">
          <grid columns="4">
            <c span="1"><h4>Audio Feature</h4></c>
            <c span="3">
              <AudioFeatures :input-id="inputConfig.id" />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1"><h4>MIDI</h4></c>
            <c span="3">
              <MIDI :input-id="inputConfig.id" />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid columns="4">
            <c span="1"><h4>Tween</h4></c>
            <c span="3">
              <Tween :input-id="inputConfig.id" />
            </c>
          </grid>
        </c>
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

export default {
  components: {
    AudioFeatures,
    MIDI,
    Tween
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

    isProp() {
      return "prop" in this.inputConfig;
    },

    focusedInputTitle() {
      return this.$modV.store.state.inputs.focusedInput.title;
    }
  }
};
</script>

<style scoped>
div.input-config {
  height: 100%;
  width: 100%;
}

grid.borders > c:not(:last-child):not(:first-child) {
  border-bottom: 1px solid var(--foreground-color-2);
}
</style>
