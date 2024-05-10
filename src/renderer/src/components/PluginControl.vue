<template>
  <Control
    @update:model-value="handleInput"
    :inputTitle="`${pluginName}: ${title}`"
    :activeProp="activeProp"
    :title="title"
    :modelValue="value"
  />
</template>

<script>
import Control from "./Control.vue";

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

  computed: {
    plugin() {
      const { id } = this;

      return this.$modV.store.state.plugins.find((item) => item.id === id);
    },

    activeProp() {
      const { plugin, prop } = this;

      return plugin.props[prop];
    },

    type() {
      return this.activeProp.type;
    },

    pluginName() {
      return this.plugin.name;
    },

    title() {
      return this.activeProp.label || this.prop;
    },

    value() {
      const { prop, type, plugin } = this;
      const propData = plugin.$props[prop];

      if (type === "tween") {
        return this.$modV.store.state.tweens.tweens[propData.id];
      }

      return propData;
    },
  },

  methods: {
    async handleInput(e) {
      const { prop, id: pluginId } = this;
      const data = e;

      try {
        await this.$modV.store.dispatch("plugins/updateProp", {
          pluginId,
          prop,
          data,
        });
      } catch (e) {
        console.error(e.message);
      }
    },
  },
};
</script>
