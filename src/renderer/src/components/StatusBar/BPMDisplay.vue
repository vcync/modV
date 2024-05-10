<template>
  <div v-contextMenu="BPMContextMenu">
    {{ Math.round($modV.store.state.beats.bpm) }} BPM
    <span>({{ $modV.store.state.beats.bpmSource }})</span>
  </div>
</template>

<script>
import { BPMContextMenu } from "../../menus/context/bpmContextMenu";

export default {
  data() {
    return {
      BPMContextMenu
    };
  }
};
</script>

<style scoped>
span {
  display: none;
}

div:hover span {
  display: inline;
}
</style>
