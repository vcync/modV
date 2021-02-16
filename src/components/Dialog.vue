<template>
  <dialog ref="dialog">
    <header>
      <button @click="close" class="close">Close</button>
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
      default: "modV"
    }
  },

  mounted() {
    this.$refs.dialog.showModal();
  },

  methods: {
    close() {
      this.$emit("close");
      this.$refs.dialog.close();
    }
  }
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
