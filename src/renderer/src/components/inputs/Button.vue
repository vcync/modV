<template>
  <button><slot /></button>
</template>

<style scoped>
button {
  appearance: none;
  background: transparent;
  margin: 0;
  padding: 8px;
  background: #151515;
  color: white;
  box-sizing: border-box;
  border: none;
  font-size: 14px;
  line-height: 1;
  font-family: inherit;
}

button:disabled {
  cursor: not-allowed;
  color: #c4c4c4;
}

button.light {
  background: #363636;
}

button.active,
button:active {
  background: #363636;
}

button.light.active,
button.light:active {
  background: #9a9a9a;
}
</style>
