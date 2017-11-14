<template>
  <keep-alive>
    <transition name="fade">
      <ul class="nwjs-menu contextmenu" ref="menu" v-if="visible">
        <component
          is="contextMenuItem"
          v-for="item, idx in items"
          :key="idx"
          :options="item"
          :parentOptions="options"
          :parentOffsetWidth="offsetWidth"
          :parentOffsetHeight="offsetHeight"
          :parentPosition="{ x: options.x, y: options.y }"
          :index="idx"
        ></component>
      </ul>
    </transition>
  </keep-alive>
</template>

<script>
  import { mapActions } from 'vuex';
  import contextMenuItem from './MenuItem';
  import isDescendant from './is-descendant';

  export default {
    name: 'contextMenu',
    props: [
      'options',
    ],
    data() {
      return {
        offsetWidth: 0,
        offsetHeight: 0,
      };
    },
    computed: {
      items() {
        return this.options.items;
      },
      visible() {
        return this.options.visible;
      },
      isSubmenu() {
        return this.options.isSubmenu;
      },
      id() {
        return this.options.$id;
      },
    },
    methods: {
      ...mapActions('contextMenu', [
        'popdownAll',
      ]),
      checkIfClickedMenu(e) {
        e.preventDefault();
        if (
          !e.target === this.$refs.menu || !isDescendant(this.$refs.menu, e.target)
        ) {
          this.popdownAll();
        }
      },
      reposition() {
        const menuEl = this.$refs.menu;
        this.$data.offsetWidth = menuEl.offsetWidth;
        this.$data.offsetHeight = menuEl.offsetHeight;

        let setRight = false;

        let x = this.options.x;
        let y = this.options.y;

        const width = menuEl.clientWidth;
        const height = menuEl.clientHeight;

        if ((x + width) > window.innerWidth) {
          setRight = true;
          if (this.isSubmenu) {
            const node = this.parentMenu.node;
            x = (node.offsetWidth + ((window.innerWidth - node.offsetLeft) - node.offsetWidth)) - 2;
          } else {
            x = 0;
          }
        }

        if ((y + height) > window.innerHeight) {
          y = window.innerHeight - height;
        }

        if (!setRight) {
          menuEl.style.left = `${x}px`;
          menuEl.style.right = 'auto';
        } else {
          menuEl.style.right = `${x}px`;
          menuEl.style.left = 'auto';
        }

        menuEl.style.top = `${y}px`;
      },
    },
    beforeMount() {
      if (!this.isSubmenu) {
        this.popdownAll([this.id]);
      }
    },
    mounted() {
      this.reposition();

      window.addEventListener('click', this.checkIfClickedMenu);
    },
    updated() {
      this.reposition();
    },
    beforeDestroy() {
      window.removeEventListener('click', this.checkIfClickedMenu);
    },
    components: {
      contextMenuItem,
    },
  };
</script>

<style lang='scss'>
  .nwjs-menu {
    font-family: 'Rubik', sans-serif;
    font-size: 14px;
    color: #2c2c2c;
    -webkit-user-select: none;
    user-select: none;
    -webkit-font-smoothing: subpixel-antialiased;
    font-weight: 400;
  }

  .contextmenu {
    min-width: 100px;
    background-color: #eee;
    position: fixed;
    // opacity: 0;
    transition: opacity 250ms;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    // pointer-events: none;
    border-radius: 7px;
    border: 1px rgba(191, 191, 191, 0.8) solid;
    box-shadow: rgba(43, 43, 43, 0.34) 1px 1px 11px 0px;
  }

  .contextmenu.show {
    opacity: 1;
    transition: opacity 30ms;
    pointer-events: all;
  }

  .contextmenu.submenu {
      transition: opacity 250ms;
  }

  .contextmenu.submenu.show {
    transition: opacity 150ms;
    transition-timing-function: step-end;
  }

  .menu-item.normal,
  .menu-item.checkbox {
    cursor: default;
    padding: 2px 0;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
    align-items: flex-start;
    width: 100%;
    max-height: 20px;
  }

  .contextmenu .menu-item.normal:hover,
  .contextmenu .menu-item.checkbox:hover,
  .menu-item.normal.submenu-active {
    background-color: #499BFE;
    color: #fff;
  }

  .menu-item.normal > div,
  .menu-item.checkbox > div {
      align-self: center;
      vertical-align: middle;
      display: inline-flex;
      justify-content: flex-start;
      flex-shrink: 0;
  }

  .menu-item.normal .icon {
      display: inline-flex;
      vertical-align: middle;
      max-width: 16px;
      max-height: 16px;
      align-self: center;
  }

  li.menu-item.separator {
    height: 2px;
    background-color: rgba(128, 128, 128, 0.2);
    margin: 5px 0;
  }

  .menu-item .modifiers,
  .menu-item .icon-wrap,
  .menu-item .checkmark {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .menu-item .checkmark {
    width: 22px;
  }

  .menu-item .modifiers {
    box-sizing: border-box;
    padding: 0 6px;
    text-align: right;
    order: 0;
      flex: 0 0 auto;
      align-self: center;
  }

  .menu-item .context-menu-label {
      padding: 0 22px 0 0;
      order: 0;
      flex: 1 0 auto;
      align-self: center;
  }

  .menu-item.disabled,
  .menu-item.disabled:hover,
  .contextmenu .menu-item.disabled:hover {
      color: #ababab;
  }

  .menu-item.disabled:hover,
  .contextmenu .menu-item.disabled:hover {
      background-color: transparent !important;
  }

  .menu-item .icon-wrap {
      padding: 0 6px 0 0;
      display: inline-flex;
      align-self: center;
  }

  .menu-item .context-menu-label-text {
      align-items: center;
      vertical-align: middle;
  }

  .menu-item.checkbox.checked .checkmark::before {
    content: '✔';
    text-align: center;
    width: 100%;
  }

  .menubar {
    height: 22px;
    margin: 0;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #eee;
    z-index: 2147483647;
  }

  .menubar .menu-item.normal {
      display: inline-block;
      width: auto;
      height: 100%;
  }

  .menubar .menu-item.normal > div {
      vertical-align: top;
  }

  .menubar .menu-item.normal .checkmark,
  .menubar .menu-item.normal .modifiers {
      display: none;
  }

  .menubar .menu-item.normal .context-menu-label {
      padding: 0 9px;
  }

  .contextmenu.menubar-submenu {
      border-radius: 0 0 7px 7px;
  }

  .contextmenu.menubar-submenu.show {
      transition: opacity 0ms;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 150ms;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .nwjs-menu.contextmenu {
    background-color: #303030;
    color: orange;
    border: none;
    border-radius: 0;
  }

  .contextmenu .menu-item.normal:hover, .contextmenu .menu-item.checkbox:hover, .menu-item.normal.submenu-active {
      background-color: orange;
  }
</style>
