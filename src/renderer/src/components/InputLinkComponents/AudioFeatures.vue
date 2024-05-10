<template>
  <grid columns="4">
    <c span="1..">
      <grid columns="4">
        <c span="1"> Audio Feature </c>
        <c span="2">
          <Select
            v-model="feature"
            class="light"
            @update:model-value="checkFeature"
          >
            <option
              v-for="featureValue in features"
              :key="featureValue"
              :value="featureValue"
            >
              {{ featureValue }}
            </option>
          </Select>
        </c>
        <c span="1">
          ({{
            feature !== "kick"
              ? $modV.features[feature] && $modV.features[feature].toFixed(2)
              : Number($modV.store.state.beats.kick)
          }})
        </c>
      </grid>
    </c>

    <c span="1..">
      <grid columns="4">
        <c span="1"> Smoothing </c>
        <c span="3">
          <RangeControl
            min="0"
            :max="MAX_SMOOTHING - SMOOTHING_STEP"
            :step="SMOOTHING_STEP"
            @update:model-value="smoothingInput"
            :value="invertedInputValue"
          />
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
import RangeControl from "../Controls/RangeControl.vue";

export default {
  props: {
    inputId: {
      type: String,
      required: true,
    },
  },

  components: {
    RangeControl,
  },

  data() {
    return {
      iVTitle: "Audio Feature Smoothing",
      iVBody:
        "Turning on audio feature smoothing gives the audio feature a smoother decent to the set minimum value when linked to module properties. Smoothing captures the last peak value of the selected audio feature and attempts to slowly decrease the value back down to the minumum value. If the peak value is greater than the current captured peak the new peak will take priority.",
      iVID: "Audio Feature Smoothing",

      features: [
        "none",
        "kick",
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
        "perceptualSpread",
        "perceptualSharpness",
      ],

      feature: "none",
      smoothingId: null,
      smoothingValue: 0,
    };
  },

  created() {
    this.restoreLinkValues();
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
    },

    invertedInputValue() {
      return this.MAX_SMOOTHING - this.smoothingValue;
    },
  },

  methods: {
    restoreLinkValues() {
      if (this.inputLink && this.inputLink.source === "meyda") {
        if (this.inputLink.args.length > 2) {
          this.smoothingValue = this.inputLink.args[2];
        }

        this.feature = this.inputLink.args[0];
      }
    },

    makeLink() {
      if (this.feature === "kick") {
        this.$modV.store.dispatch("inputs/createInputLink", {
          inputId: this.inputId,
          type: "mutation",
          location: "beats.kick",
          match: {
            type: "beats/SET_KICK",
          },
          source: "meyda",
          args: [this.feature],
        });
      } else {
        this.$modV.store.dispatch("inputs/createInputLink", {
          inputId: this.inputId,
          type: "getter",
          location: "meyda/getFeature",
          source: "meyda",
          args: [this.feature],
        });
      }
    },

    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId,
      });
    },

    smoothingInput(value) {
      this.smoothingValue = this.MAX_SMOOTHING - value;
    },

    updateInputLinkArgs(value) {
      this.$modV.store.dispatch("inputs/updateInputLink", {
        inputId: this.inputId,
        key: "args",
        value: value,
      });
    },

    checkFeature() {
      if (
        this.feature === "none" &&
        this.inputLink &&
        this.inputLink.source === "meyda"
      ) {
        this.removeLink();
      } else {
        this.makeLink();
      }
    },
  },

  watch: {
    async smoothingValue(value) {
      if (value && !this.smoothingId) {
        this.smoothingId = await this.$modV.store.dispatch(
          "meyda/getSmoothingId",
        );

        this.updateInputLinkArgs([
          this.feature,
          this.smoothingId,
          this.smoothingValue,
        ]);
      } else if (value && this.smoothingId) {
        this.updateInputLinkArgs([
          this.feature,
          this.smoothingId,
          this.smoothingValue,
        ]);
      } else if (!value && this.smoothingId) {
        this.smoothingId = null;
        this.$modV.store.dispatch("meyda/removeSmoothingId", this.smoothingId);
        this.updateInputLinkArgs([this.feature]);
      }
    },

    inputId() {
      this.restoreLinkValues();

      if (!this.inputLink || this.inputLink.source !== "meyda") {
        this.feature = "none";
        this.smoothingId = null;
        this.smoothingValue = this.MAX_SMOOTHING - this.SMOOTHING_STEP;
      }
    },
  },
};
</script>
