<template>
  <grid
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Plugins Panel' }"
    v-searchTerms="{
      terms: ['plugin', 'plug in', 'addon', 'add-on'],
      title: 'Plugins',
      type: 'Panel',
    }"
    class="borders"
  >
    <CollapsibleRow v-for="plugin in plugins" :key="plugin.id">
      <template #label>
        {{ plugin.name }}
      </template>

      <template #body>
        <c span="1..">
          <grid columns="4">
            <c span="1..">
              <grid columns="4">
                <c span="1"> Enable </c>
                <c span="3">
                  <Checkbox
                    :value="plugin.enabled"
                    :emit-boolean="true"
                    class="light"
                    @update:model-value="handleEnableInput(plugin.id)"
                  />
                </c>
              </grid>
            </c>

            <c
              v-for="(prop, propKey) in plugin.$props"
              :key="propKey"
              span="1.."
            >
              <PluginControl :id="plugin.id" :prop="propKey" />
            </c>
          </grid>
        </c>
      </template>
    </CollapsibleRow>
  </grid>
</template>

<script>
import CollapsibleRow from "./CollapsibleRow.vue";
import Checkbox from "./inputs/Checkbox.vue";
import PluginControl from "./PluginControl.vue";

export default {
  components: {
    CollapsibleRow,
    Checkbox,
    PluginControl,
  },

  data() {
    return {
      iVTitle: "Plugins",
      iVBody: "The Plugins panel lists all available Plugins.",
    };
  },

  computed: {
    plugins() {
      return this.$modV.store.state.plugins;
    },
  },

  methods: {
    handleEnableInput(pluginId) {
      const plugin = this.plugins.find((item) => item.id === pluginId);

      if (!plugin) {
        return;
      }

      this.$modV.store.dispatch("plugins/setEnabled", {
        pluginId,
        enabled: !plugin.enabled,
      });
    },
  },
};
</script>

<style></style>
