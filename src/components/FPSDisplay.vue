<template>
  <div>{{ Math.round($modV.store.state.metrics.fps) }}</div>
</template>

<style scoped>
div {
  font-family: monospace;
  position: fixed;
  top: 0;
  right: 0;

  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  pointer-events: none;
}
</style>
