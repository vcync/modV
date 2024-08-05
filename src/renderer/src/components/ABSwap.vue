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
      this.$modV.store.commit("modules/SWAP", {});
    },
  },
};
</script>
