<template>
  <div class="tabs">
    <div class="tab-menu">
      <div class="tab" v-for='i in amount' @click='focusTab(i)'>
        {{ titles[i-1] }}
      </div>
    </div>
    <div class="tab-contents">
      <div class="simplebar">
        <div class="simplebar-scroll-content">
          <div class=" simplebar-content">
            <div class="tab-content" :class="{ show: focusedTabIndex === i,}" v-for='i in amount'>
              <slot
                :name='`tab-${i}`'
              ></slot>
            </div>
          </div>
        </div>
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

    .tab {
      display: inline-block;
      height: 20px;
      padding: 5px 10px;
    }
  }
</style>
