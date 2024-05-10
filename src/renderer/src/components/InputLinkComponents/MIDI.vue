<template>
  <grid columns="4">
    <c span="2+3">
      <Button class="light" @click="manageLink">{{
        hasLink ? "Forget" : "Learn"
      }}</Button>
    </c>
  </grid>
</template>

<script>
export default {
  props: {
    inputId: {
      type: String,
      required: true,
    },
  },

  computed: {
    inputConfig() {
      return this.$modV.store.state.inputs.inputLinks[this.inputId] || {};
    },

    hasLink() {
      const link = this.$modV.store.state.inputs.inputLinks[this.inputId];

      return link && link.source === "midi";
    },
  },

  methods: {
    manageLink() {
      if (this.hasLink) {
        this.removeLink();
      } else {
        this.learn();
      }
    },

    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId,
      });

      this.hasLink = false;
    },

    async learn() {
      const message = await this.$modV._store.dispatch("midi/learn");

      const {
        data: [type, channel],
        currentTarget: { id, name, manufacturer },
      } = message;

      this.hasLink = await this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "mutation",
        source: "midi",
        location: `midi.devices['${id}-${name}-${manufacturer}'].channelData['${channel}']['${type}']`,
        match: {
          type: "midi/WRITE_DATA",
          payload: {
            id: `${id}-${name}-${manufacturer}`,
            channel,
            type,
          },
        },
        min: 0,
        max: 1,
      });
    },
  },
};
</script>
