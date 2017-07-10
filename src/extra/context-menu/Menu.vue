<template>
  <ul class="nwjs-menu contextmenu" :class="{ show: visible }" ref="menu">
    <component
      is='contextMenuItem'
      v-for='item in items'
      :options='item'
      :parentOffsetWidth='offsetWidth'
      :parentOffsetHeight='offsetHeight'
      :parentPosition='{ x: options.x, y: options.y }'
    ></component>
  </ul>
</template>

<script>
  import { mapGetters } from 'vuex';
  import contextMenuItem from './MenuItem';

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
      ...mapGetters('contextMenu', [
        'visible'
      ]),
      items() {
        return this.options.items;
      }
    },
    mounted() {
      const menuEl = this.$refs.menu;
      this.$data.offsetWidth = menuEl.offsetWidth;
      this.$data.offsetHeight = menuEl.offsetHeight;
      menuEl.style.left = `${this.options.x}px`;
      menuEl.style.top = `${this.options.y}px`;
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