<template>
  <!-- key is used to trigger re-mount of component when the next error message is available -->
  <Dialog
    v-if="message"
    :key="messageId"
    @close="dialogClosed"
    title="Error"
    style="max-width: 420px"
  >
    <component
      :is="{
        template: `<span>${this.message}</span>`
      }"
    ></component>
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
    },

    messageId() {
      return Object.keys(this.$modV.store.state.errors.messages)[0];
    }
  },

  methods: {
    dialogClosed() {
      this.$modV.store.dispatch("errors/deleteMessage", { id: this.messageId });
    }
  }
};
</script>
