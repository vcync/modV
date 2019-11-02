<template>
  <div>{{ Math.round($modV.store.state.beats.bpm) }} BPM</div>
</template>

<style scoped>
div {
  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  pointer-events: none;
}
</style>
