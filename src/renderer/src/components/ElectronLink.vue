<template>
  <a @click.prevent="openUrl"><slot /></a>
</template>

<script>
const { shell } = window.electron;

export default {
  props: {
    to: {
      type: String,
      required: true,
    },
  },

  methods: {
    openUrl() {
      shell.openExternal(this.to);
    },
  },
};
</script>

<style scoped>
a {
  cursor: pointer;
  text-decoration: underline;
}
</style>
