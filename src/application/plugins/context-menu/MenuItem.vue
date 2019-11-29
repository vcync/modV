<template>
  <li
    ref="menuitem"
    class="menu-item"
    :class="classes"
    @mouseover="mouseover"
    @click="clicked"
  >
    <div class="checkmark"></div>
    <div class="context-menu-label">
      <span class="context-menu-label-text" :title="tooltip">{{ label }}</span>
    </div>
    <div class="modifiers">{{ modifiers }}</div>
  </li>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "ContextMenuItem",
  props: [
    "index",
    "options",
    "parentOptions",
    "parentOffsetWidth",
    "parentOffsetHeight",
    "parentPosition"
  ],
  data() {
    return {
      modifiers: ""
    };
  },
  computed: {
    ...mapGetters("contextMenu", ["realActiveMenus"]),
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
    tooltip() {
      return this.options.tooltip;
    },
    submenuActive() {
      if (!this.submenu) {
        return false;
      }
      return this.realActiveMenus.indexOf(this.submenu.$id) > 0;
    },
    checked() {
      if (this.type !== "checkbox") {
        return false;
      }
      return this.options.checked;
    },
    classes() {
      const classes = {};
      if (!this.enabled) {
        classes.disabled = true;
      }
      classes[this.type] = true;

      if (this.type === "checkbox") {
        classes.checked = this.checked;
      }

      if (this.submenuActive) {
        classes["submenu-active"] = true;
      }

      return classes;
    }
  },
  beforeMount() {
    if (this.submenu) {
      this.$data.modifiers = "▶︎";
    }
  },
  methods: {
    ...mapActions("contextMenu", ["popup", "popdown", "popdownAll"]),
    ...mapMutations("contextMenu", ["editItemProperty"]),
    mouseover() {
      if (this.submenu) {
        let x = this.$refs.menuitem.offsetLeft;
        const y = this.$refs.menuitem.offsetTop + (this.parentPosition.y - 4);

        x = this.parentOffsetWidth + this.parentPosition.x;

        const submenus = this.parentOptions.submenus.filter(
          menu => menu.$id !== this.submenu.$id
        );
        for (let i = 0, len = submenus.length; i < len; i++) {
          const menu = submenus[i];
          this.popdown({ id: menu.$id });
        }
        this.popup({
          id: this.submenu.$id,
          x,
          y
        });
      } else {
        const submenus = this.parentOptions.submenus;
        for (let i = 0, len = submenus.length; i < len; i++) {
          const menu = submenus[i];
          this.popdown({ id: menu.$id });
        }
      }
    },
    clicked() {
      if (this.type === "checkbox") {
        this.editItemProperty({
          id: this.parentOptions.$id,
          index: this.index,
          property: "checked",
          value: !this.checked
        });
      }
      if (this.options.click) {
        this.options.click();
      }
      this.popdownAll();
    }
  }
};
</script>

<style scoped lang="scss"></style>
