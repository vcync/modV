<template>
  <grid columns="4">
    <c span="1..">
      <grid columns="4">
        <c span="1">
          Audio Feature
        </c>
        <c span="3">
          <Select v-model="feature" class="light">
            <option
              v-for="featureValue in features"
              :key="featureValue"
              :value="featureValue"
              >{{ featureValue }}</option
            >
          </Select>
        </c>
      </grid>
    </c>

    <c span="1..">
      <grid columns="4">
        <c span="1">
          Smoothing
        </c>
        <c span="3">
          <RangeControl
            min="0"
            :max="MAX_SMOOTHING - SMOOTHING_STEP"
            :step="SMOOTHING_STEP"
            v-model="smoothingValue"
          />
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
import hasLink from "../mixins/has-input-link";
import RangeControl from "../Controls/RangeControl";

export default {
  mixins: [hasLink],

  props: {
    inputId: {
      type: String,
      required: true
    }
  },

  components: {
    RangeControl
  },

  data() {
    return {
      iVTitle: "Audio Feature Smoothing",
      iVBody:
        "Turning on audio feature smoothing gives the audio feature a smoother decent to the set minimum value when linked to module properties. Smoothing captures the last peak value of the selected audio feature and attempts to slowly decrease the value back down to the minumum value. If the peak value is greater than the current captured peak the new peak will take priority.",
      iVID: "Audio Feature Smoothing",

      features: [
        "none",
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

      feature: "none",
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
    },

    inputLink() {
      return this.$modV.store.state.inputs.inputLinks[this.inputId];
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
    feature(value) {
      if (value === "none") {
        this.removeLink();
      } else {
        this.makeLink();
      }
    },

    async smoothingValue(value) {
      if (value && !this.smoothingId) {
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
    },

    inputId() {
      if (this.inputLink) {
        if (this.inputLink.args.length > 2) {
          this.smoothingValue = this.inputLink.args[2];
        }

        this.feature = this.inputLink.args[0];
      }
    }
  }
};
</script>

<style scoped></style>
