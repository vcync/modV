<template>
  <div>
    <grid>
      <c span="1..">{{ focusedInputTitle }}</c>

      <c span="1..">
        <AudioFeatures v-if="inputConfig" :input-id="inputConfig.id" />
      </c>

      <c span="1..">
        <MIDI v-if="inputConfig" :input-id="inputConfig.id" />
      </c>

      <c span="1..">
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
