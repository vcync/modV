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
      <Control v-for="key in props" :id="module.$id" :prop="key" :key="key" />
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
    },

    props() {
      const { module } = this;

      return Object.keys(module.$props).filter(
        key =>
          module.$props[key].type === "int" ||
          module.$props[key].type === "float" ||
          module.$props[key].type === "text" ||
          module.$props[key].type === "bool" ||
          module.$props[key].type === "color" ||
          module.$props[key].type === "vec2" ||
          module.$props[key].type === "vec3" ||
          module.$props[key].type === "vec4" ||
          module.$props[key].type === "tween" ||
          module.$props[key].type === "texture" ||
          module.$props[key].type === "enum"
      );
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

.title {
  font-size: 24px;
  padding: 8px;
}
</style>
