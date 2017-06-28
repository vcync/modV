<template>
  <div class="tabs">
    <div class="tab-menu">
      <div
        class="tab"
        v-for='i in amount' @click='focusTab(i)'
        :class="{ 'selected': focusedTabIndex === i }"
        :style="`width: ${100 / amount}%`"
      >
        {{ titles[i-1] }}
      </div>
    </div>
    <div class="tab-contents" data-simplebar-direction="vertical">
      <div class="tab-content" :class="{ show: focusedTabIndex === i }" v-for='i in amount'>
        <slot
          :name='`tab-${i}`'
        ></slot>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'tabs',
    props: [
      'titles'
    ],
    data() {
      return {
        focusedTabIndex: 1
      };
    },
    computed: {
      amount() {
        if(!this.titles) return 0;
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

<style scoped lang='scss'>

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
    border-bottom: 1px solid rgba(0,0,0,0.1);
    box-sizing: border-box;
    letter-spacing: -.31em;

    .tab {
      display: inline-block;
      height: 30px;
      background-color: #ce8602;
      box-sizing: border-box;
      padding: 6px;
      letter-spacing: -1px;
      cursor: pointer;

      &.selected {
        background-color: orange;
      }
    }
  }
</style>
