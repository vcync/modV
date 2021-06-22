<template>
  <div>
    <CollapsibleRow v-for="plugin in plugins" :key="plugin.id">
      <template v-slot:label>
        {{ plugin.name }}
      </template>

      <template v-slot:body>
        <c span="1..">
          <grid columns="4">
            <c span="1..">
              <grid columns="4">
                <c span="1">
                  Enable
                </c>
                <c span="2">
                  <Checkbox
                    @input="handleEnableInput(plugin.id)"
                    class="light"
                  />
                </c>
                <c span="1">
                  <!-- extra stuff -->
                </c>
              </grid>
            </c>
          </grid>
        </c>
      </template>
    </CollapsibleRow>
  </div>
</template>

<script>
import CollapsibleRow from "./CollapsibleRow.vue";
import Checkbox from "./inputs/Checkbox.vue";

export default {
  components: {
    CollapsibleRow,
    Checkbox
  },

  computed: {
    plugins() {
      return this.$modV.store.state.plugins;
    }
  },

  methods: {
    handleEnableInput(pluginId) {
      const plugin = this.plugins.find(item => item.id === pluginId);

      if (!plugin) {
        return;
      }

      this.$modV.store.dispatch("plugins/setEnabled", {
        pluginId,
        enabled: !plugin.enabled
      });
    }
  }
};
</script>
