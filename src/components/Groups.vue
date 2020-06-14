<template>
  <grid class="groups">
    <c span="1..">
      <button @click="createGroup">Create new Group</button>
    </c>
    <Container
      drag-handle-selector=".group-title"
      lock-axis="y"
      group-name="groups"
      :should-animate-drop="() => false"
      tag="c"
      span="1.."
      class="group-container"
      @drop="onDrop"
    >
      <Draggable v-for="group in groups" :key="group.id">
        <Group :groupId="group.id" />
      </Draggable>
    </Container>
  </grid>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import Group from "./Group";

const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) {
    return arr;
  }

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
        return this.$modV.store.state.groups.groups.filter(
          group => !group.hidden
        );
      },

      async set(value) {
        await this.$modV.store.dispatch("groups/orderByIds", {
          ids: value.map(group => group.id)
        });
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

    onDrop(e) {
      console.log("drop");
      this.groups = applyDrag(this.groups, e);
    }
  }
};
</script>

<style scoped>
div.groups {
  color: var(--foreground-color);
  background-color: var(--background-color);

  height: 100%;
  width: 100%;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
}

div.group-container {
  overflow-y: auto;
  flex: 1;
}
</style>
