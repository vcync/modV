export default {
  computed: {
    inputIsFocused() {
      return this.$modV.store.state.inputs.focusedInput === this.inputId;
    }
  }
};
