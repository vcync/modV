<template>
  <div
    class="groups"
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Groups Panel' }"
    v-searchTerms="{
      terms: ['groups', 'layers'],
      title: 'Groups',
      type: 'Panel'
    }"
  >
    <Container
      drag-handle-selector=".group__title"
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

    <Button class="light" @click="createGroup">New Group</Button>
  </div>
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
      iVTitle: "Groups",
      iVBody:
        "Groups contain Modules. Modules within Groups can be rearranged to change the drawing order. Groups can also be rearranged by dragging their title bar.",
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
      this.groups = applyDrag(this.groups, e);
    }
  }
};
</script>

<style scoped>
div.groups {
  height: 100%;
  width: 100%;
}

div.group-container {
  overflow-y: auto;
  flex: 1;
}
</style>
