<template>
  <Control
    @update:modelValue="handleInput"
    :inputTitle="`${moduleName}: ${title}`"
    :activeProp="activeProp"
    :moduleId="id"
    :prop="prop"
    :title="title"
    :modelValue="value"
    v-contextMenu="
      () =>
        ActiveModuleControlContextMenu({ moduleId: id, propName: prop, title })
    "
  />
</template>

<script>
import Control from "./Control.vue";
import { ActiveModuleControlContextMenu } from "../menus/context/activeModuleControlContextMenu.js";
import { toRaw } from "vue";

export default {
  components: {
    Control,
  },

  props: {
    prop: {
      type: String,
      required: true,
    },

    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      ActiveModuleControlContextMenu,
    };
  },

  computed: {
    activeProp() {
      const { id, prop } = this;
      return this.$modV.store.state.modules.active[id].$props[prop];
    },

    type() {
      return this.activeProp.type;
    },

    moduleName() {
      const { id } = this;
      return this.$modV.store.state.modules.active[id].meta.name;
    },

    title() {
      return this.activeProp?.label || this.prop;
    },

    value() {
      const { id, prop, type } = this;
      const propData = this.$modV.store.state.modules.active[id].props[prop];

      if (type === "tween") {
        return this.$modV.store.state.tweens.tweens[propData.id];
      }

      return propData;
    },
  },

  methods: {
    async handleInput(e) {
      const { prop, id: moduleId } = this;
      const data = e;

      try {
        this.$modV.store.dispatch("modules/updateProp", {
          moduleId,
          prop,
          data: JSON.parse(JSON.stringify(data)),
        });
      } catch (e) {
        console.error(e.message);
      }
    },
  },
};
</script>
