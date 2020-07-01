<template>
  <!-- <div class="icon trash-layer" @click='removeFocusedLayer' title="Remove Focused Layer">
    <span class="ibvf"></span>
      <i class="fa fa-trash" aria-hidden="true"></i>
  </div> -->
  <button
    class="button is-primary is-small"
    title="Remove Focused Layer"
    @click="removeFocusedLayer"
  >
    <b-icon icon="trash"></b-icon>
  </button>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "RemoveLayerButton",
  methods: {
    ...mapActions("layers", ["removeFocusedLayer"])
  }
};
</script>

<style scoped></style>
