<template>
  <div class="groups">
    <button @click="createGroup">Create new Group</button>
    <select v-model="module">
      <option
        v-for="module in registeredModules"
        :key="module.meta.name"
        :value="module.meta.name"
        >{{ module.meta.name }}</option
      >
    </select>
    <select v-model="group">
      <option v-for="group in groups" :key="group.id" :value="group.id">{{
        group.name
      }}</option>
    </select>
    <button @click="addModuleToGroup">Add Module To Group</button>

    <Container
      drag-handle-selector=".group-title"
      lock-axis="y"
      group-name="groups"
      :should-animate-drop="() => false"
      tag="div"
      class="group-container"
      @drop="onDrop"
    >
      <Draggable v-for="group in groups" :key="group.id" class="group">
        <Group :groupId="group.id" />
      </Draggable>
    </Container>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import Group from "./Group";

const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

export default {
  components: {
    Container,
    Draggable,
    Group
  },

  data() {
    return {
      module: "",
      group: ""
    };
  },

  computed: {
    groups: {
      get() {
        return this.$modV.store.state.groups.filter(group => !group.hidden);
      },

      set(value) {
        this.$modV.store.commit("groups/REPLACE_GROUPS", value);
      }
    },

    registeredModules() {
      return this.$modV.store.state.modules.registered;
    }
  },

  methods: {
    async createGroup() {
      this.$modV.store.dispatch("groups/createGroup");
    },

    async addModuleToGroup() {
      const module = await this.$modV.store.dispatch(
        "modules/makeActiveModule",
        { moduleName: this.module }
      );

      this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
        moduleId: module.id,
        groupId: this.group
      });
    },

    onDrop(e) {
      this.groups = applyDrag(this.groups, e);
    }
  }
};
</script>

<style scoped>
div.groups {
  font-family: monospace;
  position: fixed;
  bottom: 0;
  left: 0;

  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  max-width: 72%;
  max-height: 400px;
  height: 100%;
}

div.group-container {
  overflow-y: auto;
  height: 100%;
}
</style>
