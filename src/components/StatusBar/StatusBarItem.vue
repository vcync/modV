<template>
  <span span="1" class="statusbar-item tag">
    <slot></slot>
  </span>
</template>

<style scoped>
.statusbar-item {
  color: #000;
  display: inline-flex;
  height: 100%;
  align-items: center;
  justify-content: center;

  font-family: "IBM Plex Mono", monospace;
}

.tag {
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #4a4a4a;
  display: inline-flex;
  font-size: 0.9rem;
  height: 2em;
  justify-content: center;
  line-height: 1.5;
  padding-left: 0.75em;
  padding-right: 0.75em;
  white-space: nowrap;
}
</style>
