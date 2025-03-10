export default {
  computed: {
    hasLink() {
      return this.$modV.store.state.inputs.inputLinks[this.inputId];
    },
  },
};
