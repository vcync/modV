<template>
  <ul class="nwjs-menu contextmenu" :class='{ show: visible }' ref="menu">
    <component
      is='contextMenuItem'
      v-for='item, idx in items'
      :options='item'
      :parentOptions='options'
      :parentOffsetWidth='offsetWidth'
      :parentOffsetHeight='offsetHeight'
      :parentPosition='{ x: options.x, y: options.y }'
      :index='idx'
    ></component>
  </ul>
</template>

<script>
  import { mapActions } from 'vuex';
  import contextMenuItem from './MenuItem';
  import isDescendant from './is-descendant';

  export default {
    name: 'contextMenu',
    props: [
      'options'
    ],
    data() {
      return {
        offsetWidth: 0,
        offsetHeight: 0
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
      }
    },
    methods: {
      ...mapActions('contextMenu', [
        'popdownAll'
      ]),
      checkIfClickedMenu(e) {
        e.preventDefault();
        if(
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

        if((x + width) > window.innerWidth) {
          setRight = true;
          if(this.isSubmenu) {
            const node = this.parentMenu.node;
            x = (node.offsetWidth + ((window.innerWidth - node.offsetLeft) - node.offsetWidth)) - 2;
          } else {
            x = 0;
          }
        }

        if((y + height) > window.innerHeight) {
          y = window.innerHeight - height;
        }

        if(!setRight) {
          menuEl.style.left = `${x}px`;
          menuEl.style.right = 'auto';
        } else {
          menuEl.style.right = `${x}px`;
          menuEl.style.left = 'auto';
        }

        menuEl.style.top = `${y}px`;
      }
    },
    beforeMount() {
      if(!this.isSubmenu) {
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
      contextMenuItem
    }
  };
</script>

<style scoped lang='scss'>
  .nwjs-menu {
    font-family: 'Helvetica Neue', HelveticaNeue, 'TeX Gyre Heros', TeXGyreHeros, FreeSans, 'Nimbus Sans L', 'Liberation Sans', Arimo, Helvetica, Arial, sans-serif;
    font-size: 14px;
    color: #2c2c2c;
    -webkit-user-select: none;
    user-select: none;
    -webkit-font-smoothing: subpixel-antialiased;
    font-weight: 400;


    &.contextmenu {
      min-width: 100px;
      background-color: #eee;
      position: fixed;
      opacity: 0;
      transition: opacity 250ms;
      margin: 0;
      padding: 4px 0;
      list-style: none;
      pointer-events: none;
      border-radius: 7px;
      border: 1px rgba(191, 191, 191, 0.8) solid;
      box-shadow: rgba(43, 43, 43, 0.34) 1px 1px 11px 0px;

      &.show {
        opacity: 1;
        transition: opacity 30ms;
        pointer-events: all;
      }
    }
  }
</style>