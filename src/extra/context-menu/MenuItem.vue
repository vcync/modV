<template>
  <li class="menu-item" :class="classes" ref="menuitem" @mouseover='mouseover' @click='clicked'>
    <div class="checkmark"></div>
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <div class="modifiers">{{ modifiers }}</div>
  </li>
</template>

<script>
  import { mapActions, mapMutations } from 'vuex';

  export default {
    name: 'contextMenuItem',
    props: [
      'index',
      'options',
      'parentOptions',
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
      checked() {
        if(this.type !== 'checkbox') return false;
        return this.options.checked;
      },
      classes() {
        const classes = {};
        if(!this.enabled) classes.disabled = true;
        classes[this.type] = true;

        if(this.type === 'checkbox') {
          classes.checked = this.checked;
        }

        return classes;
      }
    },
    methods: {
      ...mapActions('contextMenu', [
        'popup',
        'popdown',
        'popdownAll'
      ]),
      ...mapMutations('contextMenu', [
        'editItemProperty'
      ]),
      mouseover() {
        if(this.submenu) {
          let x = this.$refs.menuitem.offsetLeft;
          const y = this.$refs.menuitem.offsetTop + (this.parentPosition.y - 4);

          x = this.parentOffsetWidth + this.parentPosition.x;

          this.parentOptions.submenus
            .filter(menu => menu.$id !== this.submenu.$id)
            .forEach(menu => this.popdown({ id: menu.$id }));

          this.popup({
            id: this.submenu.$id,
            x,
            y
          });
        } else {
          this.parentOptions.submenus
            .forEach(menu => this.popdown({ id: menu.$id }));
        }
      },
      clicked() {
        if(this.type === 'checkbox') {
          this.editItemProperty({
            id: this.parentOptions.$id,
            index: this.index,
            property: 'checked',
            value: !this.checked
          });
        }
        if(this.options.click) this.options.click();
        this.popdownAll();
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