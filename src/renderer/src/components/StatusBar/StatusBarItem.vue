<template>
  <span span="1" class="statusbar-item tag">
    <slot></slot>
  </span>
</template>

<style scoped>
.statusbar-item {
  /* Pill */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 15px;
  gap: 10px;

  background: #9a9a9a;
  border-radius: 25px;

  font-family: inherit;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  /* identical to box height */
  display: flex;
  align-items: center;
  text-align: center;

  color: #000000;
}
</style>
