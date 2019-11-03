<template>
  <grid columns="8" class="status-bar tags">
    <!-- <status-bar-item v-for="(item, itemName) in statusBarItems" :key="itemName">
      <component :is="item"></component>
    </status-bar-item> -->
    <c span="1+4" class="items">
      <StatusBarItem v-for="(item, itemName) in builtInItems" :key="itemName">
        <component :is="item"></component>
      </StatusBarItem>
    </c>

    <!-- <project-item></project-item> -->
  </grid>
</template>

<script>
import StatusBarItem from "./StatusBarItem";
import FPSDisplay from "./FPSDisplay";
import BPMDisplay from "./BPMDisplay";
import SizeDisplay from "./SizeDisplay";

// import projectItem from "./Project";

export default {
  components: {
    // projectItem,
    StatusBarItem,
    FPSDisplay,
    BPMDisplay,
    SizeDisplay
  },

  data() {
    return {
      builtInItems: ["FPSDisplay", "BPMDisplay", "SizeDisplay"]
    };
  }
};
</script>

<style lang="scss">
.status-bar {
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

.tags .tag:not(:last-child) {
  margin-right: 0.5rem;
}

.items {
  display: inline-flex;
  align-items: center;
}
</style>
