<template>
  <grid columns="4">
    <c span="2+3">
      <Button class="light" @click="learn">Learn</Button>
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
