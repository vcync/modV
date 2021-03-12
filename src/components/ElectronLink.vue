<template>
  <a @click.prevent="openUrl"><slot /></a>
</template>

<script>
import { shell } from "electron";

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },

  methods: {
    openUrl() {
      shell.openExternal(this.to);
    }
  }
};
</script>

<style scoped>
a {
  cursor: pointer;
  text-decoration: underline;
}
</style>
