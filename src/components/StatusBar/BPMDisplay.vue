<template>
  <div>
    {{ Math.round($modV.store.state.beats.bpm) }} BPM
    <span>({{ $modV.store.state.beats.bpmSource }})</span>
  </div>
</template>

<style scoped>
span {
  display: none;
}

div:hover span {
  display: inline;
}
</style>
