<template>
  <div
    class="input-config"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Input Config Panel' }"
  >
    <grid columns="2">
      <c span="1..">{{ focusedInputTitle }}</c>

      <c span="1">Audio Feature</c>
      <c span="1">
        <AudioFeatures v-if="inputConfig" :input-id="inputConfig.id" />
      </c>

      <c span="1">MIDI</c>
      <c span="1">
        <MIDI v-if="inputConfig" :input-id="inputConfig.id" />
      </c>

      <c span="1">Tween</c>
      <c span="1">
        <Tween v-if="inputConfig" :input-id="inputConfig.id" />
      </c>
    </grid>
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
</style>
