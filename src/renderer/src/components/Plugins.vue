<template>
  <grid
    class="borders"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Plugins Panel' }"
    v-searchTerms="{
      terms: ['plugin', 'plug in', 'addon', 'add-on'],
      title: 'Plugins',
      type: 'Panel',
    }"
  >
    <CollapsibleRow v-for="plugin in plugins" :key="plugin.id">
      <template v-slot:label>
        {{ plugin.name }}
      </template>

      <template v-slot:body>
        <c span="1..">
          <grid columns="4">
            <c span="1..">
              <grid columns="4">
                <c span="1"> Enable </c>
                <c span="3">
                  <Checkbox
                    @update:model-value="handleEnableInput(plugin.id)"
                    :value="plugin.enabled"
                    :emitBoolean="true"
                    class="light"
                  />
                </c>
              </grid>
            </c>

            <c
              span="1.."
              v-for="(prop, propKey) in plugin.$props"
              :key="propKey"
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
