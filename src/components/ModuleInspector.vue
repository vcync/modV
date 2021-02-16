<template>
  <grid v-if="module.props" ref="moduleInspector">
    <c span="1.." class="hidden">
      <button class="pin-button" @click="toggleModulePin(module.$id)">
        {{ isPinned(module.$id) ? "(Unpin)" : "(Pin)" }}
      </button>
    </c>
    <c span="1..">
      <div class="title">{{ module.meta.name }}</div>
    </c>
    <c span="1..">
      <Control
        v-for="key in getProps(module.$moduleName)"
        :id="module.$id"
        :prop="key"
        :key="key"
      />
    </c>
  </grid>
</template>

<script>
import Control from "@/components/Control";

export default {
  props: ["moduleId"],

  components: {
    Control
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

      return Object.keys(moduleDefinition.props).filter(
        key =>
          moduleDefinition.props[key].type === "int" ||
          moduleDefinition.props[key].type === "float" ||
          moduleDefinition.props[key].type === "text" ||
          moduleDefinition.props[key].type === "bool" ||
          moduleDefinition.props[key].type === "color" ||
          moduleDefinition.props[key].type === "vec2" ||
          moduleDefinition.props[key].type === "vec3" ||
          moduleDefinition.props[key].type === "vec4" ||
          moduleDefinition.props[key].type === "tween" ||
          moduleDefinition.props[key].type === "texture" ||
          moduleDefinition.props[key].type === "enum"
      );
    }
  }
};
</script>

<style lang="scss">
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

.title {
  font-size: 24px;
  padding: 8px;
}
</style>
