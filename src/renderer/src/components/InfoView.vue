<template>
  <div
    class="info-view"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Info View Panel' }"
  >
    <grid columns="1">
      <c class="title">{{ focused && focused.title }}</c>
      <c class="body">{{ focused && focused.body }}</c>
    </grid>
  </div>
</template>

<script>
export default {
  data() {
    return {
      iVTitle: "Info View",
      iVBody:
        "The Info view provides a brief description of the user interface element that the mouse is currently over."
    };
  },

  computed: {
    focused() {
      const { infoView } = this.$store.state;
      return infoView.dictionary[infoView.focused];
    }
  }
};
</script>

<style scoped>
.info-view {
  height: 100%;
}

.title {
  font-weight: normal;
  margin: 0;
  font-size: 24px;
}
</style>
