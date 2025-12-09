<template>
  <dialog ref="dialog">
    <header>
      <button class="close" @click="close">Close</button>
      <span>{{ title }}</span>
    </header>

    <div class="body">
      <slot></slot>
    </div>
  </dialog>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "modV",
    },
  },

  emits: ["close"],

  mounted() {
    this.$refs.dialog.showModal();
    
    // Listen for native dialog close events
    this.$refs.dialog.addEventListener('close', this.handleNativeClose);
    this.$refs.dialog.addEventListener('cancel', this.handleNativeClose);
  },

  beforeUnmount() {
    // Clean up event listeners
    if (this.$refs.dialog) {
      this.$refs.dialog.removeEventListener('close', this.handleNativeClose);
      this.$refs.dialog.removeEventListener('cancel', this.handleNativeClose);
    }
  },

  methods: {
    close() {
      this.$emit("close");
      this.$refs.dialog.close();
    },

    handleNativeClose() {
      // Emit close event when dialog is closed via ESC or clicking outside
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
dialog {
  /* Dialog Box */
  border: 1px solid #c4c4c4;
  background-color: #151515;
  color: #ffffff;

  padding: 0;

  min-width: 310px;
  margin-bottom: auto; /* fixes an issue with a raster :last-child global selector */
}

header {
  font-size: 14px;
  line-height: 17px;
  background-color: #363636;
  text-align: center;
  padding: 6px 8px;
}

button.close {
  /* Close Button */

  position: absolute;
  width: 12px;
  height: 12px;
  left: 8px;
  top: 8px;

  background-color: #bc1010;
  border: none;
  border-radius: 50%;
  font-size: 0;
}

div.body {
  min-height: 72px;
  padding: 8px;
}
</style>
