<template>
  <div>
    <button @click="swap">Swap</button>
  </div>
</template>

<script>
export default {
  methods: {
    swap() {
      this.$modV.store.commit("groups/SWAP", {});
    }
  }
};
</script>

<style lang="scss" scoped></style>
