<template>
  <li class="menu-item" :class="classes" ref="menuitem" @mouseover='mouseover' @mouseout='mouseout' @click='clicked'>
    <div class="checkmark"></div>
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <div class="modifiers">{{ modifiers }}</div>
  </li>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'contextMenuItem',
    props: [
      'options',
      'parentOffsetWidth',
      'parentOffsetHeight',
      'parentPosition'
    ],
    data() {
      return {
        modifiers: ''
      };
    },
    computed: {
      type() {
        return this.options.type;
      },
      label() {
        return this.options.label;
      },
      enabled() {
        return this.options.enabled;
      },
      submenu() {
        return this.options.submenu;
      },
      classes() {
        const classes = {};
        if(!this.enabled) classes.disabled = true;
        classes[this.type] = true;

        return classes;
      }
    },
    methods: {
      ...mapActions('contextMenu', [
        'popup',
        'popdown'
      ]),
      mouseover() {
        console.log('sup');
        if(this.submenu) {
          let x = this.$refs.menuitem.offsetLeft;
          const y = this.$refs.menuitem.clientHeight + this.parentPosition.y;

          x = this.parentOffsetWidth + this.parentPosition.x;

          this.popup({
            id: this.submenu.$id,
            x,
            y
          });
        }
      },
      clicked() {
        if(this.options.click) this.options.click();
      }
    },
    beforeMount() {
      if(this.submenu) {
        this.$data.modifiers = '▶︎';
      }
    },
    beforeDestroy() {

    }
  };
</script>

<style scoped lang='scss'>

</style>