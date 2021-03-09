<template>
  <Dialog v-if="message" @close="dialogClosed" title="Error">
    <grid columns="4">
      <c span="1">
        <label>Error</label>
      </c>
      <c span="3" v-html="message"></c>
    </grid>
  </Dialog>
</template>

<script>
import Dialog from "./Dialog";

export default {
  components: {
    Dialog
  },

  computed: {
    message() {
      return Object.values(this.$modV.store.state.errors.messages)[0];
    }
  }
};
</script>
