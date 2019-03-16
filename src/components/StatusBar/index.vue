<template>
  <div class="status-bar tags">
    <status-bar-item v-for="(item, itemName) in statusBarItems" :key="itemName">
      <component :is="item"></component>
    </status-bar-item>

    <project-item></project-item>
  </div>
</template>

<script>
import StatusBarItem from './StatusBarItem'
import projectItem from './Project'

export default {
  name: 'StatusBar',
  components: {
    projectItem,
    StatusBarItem
  },
  computed: {
    statusBarItems() {
      return this.$store.state.plugins.statusbar
    }
  }
}
</script>

<style lang="scss">
.status-bar {
  position: absolute;
  bottom: -35px;
  left: 0;
  right: 0;
  padding-left: 0.5rem;

  background-color: #c1c1c1;
  height: 35px;

  &.tags {
    margin: 0;

    &:not(:last-child) {
      margin-bottom: 0;
    }

    .tag {
      margin-bottom: 0;
    }
  }
}
</style>
