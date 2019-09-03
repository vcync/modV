<template>
  <div v-show="show">
    {{ $modV.store.state.size.width }} × {{ $modV.store.state.size.height }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      timer: null
    };
  },

  computed: {
    area() {
      return this.$modV.store.getters["size/area"];
    }
  },

  watch: {
    area() {
      this.show = true;
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.show = false;
      }, 1000);
    }
  }
};
</script>

<style scoped>
div {
  font-family: monospace;
  position: fixed;
  top: 0;
  left: 0;

  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  pointer-events: none;
}
</style>
