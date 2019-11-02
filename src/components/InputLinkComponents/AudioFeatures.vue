<template>
  <grid columns="4">
    <c>
      <select v-model="feature">
        <option v-for="feature in features" :key="feature" :value="feature">{{
          feature
        }}</option>
      </select>
    </c>
    <c>
      <button @click="makeLink">Make link</button>
    </c>
    <c>
      <button @click="removeLink" :disabled="!hasLink">Remove link</button>
    </c>
  </grid>
</template>

<script>
import hasLink from "../mixins/has-input-link";

export default {
  mixins: [hasLink],

  props: {
    inputId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      features: [
        "rms",
        "zcr",
        "energy",
        "spectralCentroid",
        "spectralFlatness",
        "spectralSlope",
        "spectralRolloff",
        "spectralSpread",
        "spectralSkewness",
        "spectralKurtosis",
        "loudness",
        "perceptualSpread",
        "perceptualSharpness"
      ],

      feature: "rms"
    };
  },

  methods: {
    makeLink() {
      this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "getter",
        location: "meyda/getFeature",
        args: [this.feature]
      });
    },

    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId
      });
    }
  }
};
</script>

<style scoped></style>
