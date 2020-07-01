<template>
  <div>
    <b-field label="Selection X" class="has-text-light">
      <b-input v-model="x" type="number"></b-input>
    </b-field>
    <b-field label="Selection Y" class="has-text-light">
      <b-input v-model="y" type="number"></b-input>
    </b-field>
    <b-field label="Luminave URL" class="has-text-light">
      <b-input v-model="url" type="string"></b-input>
    </b-field>
    <button class="button" @click="showCanvas = !showCanvas">
      {{ showCanvas ? "Hide " : "Show " }}Canvas
    </button>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "GrabCanvasControlPanel",
  computed: {
    x: {
      get() {
        return this.$store.state.grabCanvas.selectionX;
      },

      set(value) {
        this.setSelection({
          selectionX: value
        });
      }
    },

    y: {
      get() {
        return this.$store.state.grabCanvas.selectionY;
      },

      set(value) {
        this.setSelection({
          selectionY: value
        });
      }
    },

    url: {
      get() {
        return this.$store.state.grabCanvas.url;
      },

      set(value) {
        this.setUrl({
          url: value
        });
      }
    },

    showCanvas: {
      get() {
        return this.$store.state.grabCanvas.showCanvas;
      },

      set(value) {
        this.setShowCanvas({
          showCanvas: value
        });
      }
    }
  },
  methods: {
    ...mapMutations("grabCanvas", ["setSelection", "setUrl", "setShowCanvas"])
  }
};
</script>

<style lang="scss"></style>
