<template>
  <grid
    v-if="module.props"
    ref="moduleInspector"
    :id="`module-inspector-${module.$id}`"
  >
    <c span="1.." class="hidden">
      <button class="pin-button" @click="toggleModulePin(module.$id)">
        ({{ isPinned(module.$id) ? "Unpin" : "Pin" }})
      </button>
    </c>
    <c span="1..">
      <div class="module-inspector__title">{{ module.meta.name }}</div>
    </c>
    <c span="1..">
      <ModuleControl
        v-for="key in getProps(module.$moduleName)"
        :id="module.$id"
        :prop="key"
        :key="key"
      />
    </c>
  </grid>
</template>

<script>
import ModuleControl from "@/components/ModuleControl";

export default {
  props: ["moduleId"],

  components: {
    ModuleControl
  },

  mounted() {
    this.$parent.$on("tab", tab => {
      const button = this.$refs.moduleInspector.querySelector(
        "button.pin-button"
      );

      tab.element.append(button);
    });
  },

  computed: {
    module() {
      return this.$modV.store.state.modules.active[this.moduleId];
    }
  },

  methods: {
    isPinned(id) {
      return this.$store.state["ui-modules"].pinned.indexOf(id) > -1;
    },

    toggleModulePin(id) {
      if (this.isPinned(id)) {
        this.$store.commit("ui-modules/REMOVE_PINNED", id);
      } else {
        this.$store.commit("ui-modules/ADD_PINNED", id);
      }
    },

    getProps(moduleName) {
      const moduleDefinition = this.$modV.store.state.modules.registered[
        moduleName
      ];

      return Object.keys(moduleDefinition.props).filter(key =>
        this.$modV.store.getters["dataTypes/types"].includes(
          moduleDefinition.props[key].type
        )
      );
    }
  }
};
</script>

<style>
button.pin-button {
  border: 0;
  background: 0;
  padding: 1px 0.5rem;
  vertical-align: top;
  cursor: pointer;
  color: white;
}
</style>

<style scoped>
grid {
  row-gap: 0;
  margin: -8px;
}

.module-inspector__title {
  font-size: 24px;
  padding: 8px;
}
</style>
