<template>
  <grid columns="4">
    <c>
      <button @click="learn">Learn</button>
    </c>
    <c>
      min: <input type="number" v-model.number="min" min="-100" max="100" />
    </c>
    <c>
      max: <input type="number" v-model.number="max" min="-100" max="100" />
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
    return {};
  },

  computed: {
    inputConfig() {
      const { $modV } = this;
      return $modV.store.state.inputs.inputLinks[this.inputId] || {};
    },

    min: {
      get() {
        return this.inputConfig.min;
      },

      set(value) {
        this.$modV.store.commit("inputs/UPDATE_INPUT_LINK", {
          inputId: this.inputId,
          key: "min",
          value
        });
      }
    },

    max: {
      get() {
        return this.inputConfig.max;
      },

      set(value) {
        this.$modV.store.commit("inputs/UPDATE_INPUT_LINK", {
          inputId: this.inputId,
          key: "max",
          value
        });
      }
    }
  },

  methods: {
    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId
      });
    },

    async learn() {
      const message = await this.$modV._store.dispatch("midi/learn");

      const {
        data: [type, channel],
        currentTarget: { id, name, manufacturer }
      } = message;

      this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "state",
        location: `midi.devices['${id}-${name}-${manufacturer}'].channelData['${channel}']['${type}']`,
        min: 0,
        max: 1
      });
    }
  }
};
</script>

<style scoped></style>
