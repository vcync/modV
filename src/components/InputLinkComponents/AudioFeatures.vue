<template>
  <grid columns="4">
    <c span="2">
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
    <c span="4" v-infoView="{ title: iVTitle, body: iVBody, id: iVID }">
      <grid columns="2"
        ><c>
          <label
            >Use smoothing?<input type="checkbox" v-model="useSmoothing"
          /></label>
        </c>
        <c>
          <label
            >Smoothing<input
              type="range"
              min="0"
              :max="MAX_SMOOTHING - SMOOTHING_STEP"
              :step="SMOOTHING_STEP"
              @input="smoothingInput"/></label
        ></c>
      </grid>
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
      iVTitle: "Audio Feature Smoothing",
      iVBody:
        "Turning on audio feature smoothing gives the audio feature a smoother decent to the set minimum value when linked to module properties. Smoothing captures the last peak value of the selected audio feature and attempts to slowly decrease the value back down to the minumum value. If the peak value is greater than the current captured peak the new peak will take priority.",
      iVID: "Audio Feature Smoothing",

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

      feature: "rms",
      smoothingId: null,
      smoothingValue: 0,
      useSmoothing: false
    };
  },

  computed: {
    MAX_SMOOTHING() {
      return this.$modV.store.state.meyda.MAX_SMOOTHING;
    },

    SMOOTHING_STEP() {
      return this.$modV.store.state.meyda.SMOOTHING_STEP;
    }
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
    },

    smoothingInput(e) {
      if (!this.useSmoothing || !this.smoothingId) {
        return;
      }

      const realValue = parseFloat(e.target.value);
      this.smoothingValue = this.MAX_SMOOTHING - realValue;

      this.updateInputLinkArgs([
        this.feature,
        this.smoothingId,
        this.smoothingValue
      ]);
    },

    updateInputLinkArgs(value) {
      this.$modV.store.dispatch("inputs/updateInputLink", {
        inputId: this.inputId,
        key: "args",
        value: value
      });
    }
  },

  watch: {
    async useSmoothing(value) {
      if (value) {
        this.smoothingId = await this.$modV.store.dispatch(
          "meyda/getSmoothingId"
        );

        this.updateInputLinkArgs([
          this.feature,
          this.smoothingId,
          this.smoothingValue
        ]);
      } else {
        this.smoothingId = null;
        this.$modV.store.dispatch("meyda/removeSmoothingId", this.smoothingId);
        this.updateInputLinkArgs([this.feature]);
      }
    }
  }
};
</script>

<style scoped></style>
