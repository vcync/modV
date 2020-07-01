<template>
  <div class="tabs">
    <div class="tab-menu">
      <div
        v-for="i in amount"
        :key="i"
        class="tab"
        :class="{ selected: focusedTabIndex === i }"
        :style="`width: ${100 / amount}%`"
        @click="focusTab(i)"
      >
        {{ titles[i - 1] }}
      </div>
    </div>
    <div class="tab-contents" data-simplebar-direction="vertical">
      <div
        v-for="i in amount"
        :key="i"
        class="tab-content"
        :class="{ show: focusedTabIndex === i }"
      >
        <slot :name="`tab-${i}`"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Tabs",
  props: {
    title: {
      default: () => [],
      type: Array
    }
  },
  data() {
    return {
      focusedTabIndex: 1
    };
  },
  computed: {
    amount() {
      if (!this.titles) return 0;
      return this.titles.length;
    }
  },
  methods: {
    focusTab(tabIndex) {
      this.focusedTabIndex = tabIndex;
    }
  }
};
</script>

<style scoped lang="scss">
/* tabs */

.tabs,
.tab-contents,
.simplebar {
  height: 100%;
}

.tab-content {
  display: none;
}

.tab-content.show {
  display: block;
}

.tab-menu {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .tab {
    display: inline-block;
    height: 30px;
    background-color: #ce8602;
    box-sizing: border-box;
    padding: 6px;
    cursor: pointer;

    &.selected {
      background-color: orange;
    }
  }
}
</style>
