<template>
  <grid columns="4" class="status-bar tags">
    <c span="1+4" class="items">
      <StatusBarItem v-for="(item, itemName) in builtInItems" :key="itemName">
        <component :is="item"></component>
      </StatusBarItem>

      <StatusBarItem class="version">
        {{ version }}
      </StatusBarItem>
    </c>
  </grid>
</template>

<script>
import packageInfo from "../../../../../package.json";
import StatusBarItem from "./StatusBarItem.vue";
import FPSDisplay from "./FPSDisplay.vue";
import BPMDisplay from "./BPMDisplay.vue";
import SizeDisplay from "./SizeDisplay.vue";

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
      builtInItems: ["FPSDisplay", "BPMDisplay", "SizeDisplay"],
      version: packageInfo.version
    };
  }
};
</script>

<style>
.status-bar {
  /* padding-left: 0.5rem; */

  /* Status Bar */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px;
  gap: 8px;

  background: #363636;
}

.status-bar.tags {
  margin: 0;
}

.status-bar:not(:last-child) {
  margin-bottom: 0;
}

.status-bar .tag {
  margin-bottom: 0;
}

.tags .tag:not(:last-child) {
  margin-right: 0.5rem;
}

.items {
  display: inline-flex;
  align-items: center;
}

.version {
  position: absolute;
  right: 8px;
}
</style>
