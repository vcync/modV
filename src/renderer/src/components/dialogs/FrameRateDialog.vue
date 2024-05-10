<template>
  <Dialog
    v-if="$store.state.dialogs.open.includes('frameRate')"
    @close="dialogClosed"
    title="Framerate Options"
  >
    <grid columns="4">
      <c span="1">
        <label>Target FPS</label>
      </c>
      <c span="3">
        <Number v-model.number="fps" />
      </c>
    </grid>
  </Dialog>
</template>

<script>
import Dialog from "../Dialog.vue";
import Number from "../inputs/Number.vue";

export default {
  components: {
    Dialog,
    Number
  },

  computed: {
    fps: {
      get() {
        return this.$modV.store.state.fps.fps;
      },

      set(fps) {
        this.$modV.store.commit("fps/SET_FPS", { fps });
      }
    }
  },

  methods: {
    dialogClosed() {
      this.$store.commit("dialogs/REMOVE_OPEN", "frameRate");
    }
  }
};
</script>
