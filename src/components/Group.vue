<template>
  <div @focus="focus" @mousedown="focus" :class="{ focused }" class="group">
    <section class="group-controls">
      <input type="checkbox" v-model="enabled" title="Enabled" />
      <input type="checkbox" v-model="inherit" title="Inherit" />
      <input type="checkbox" v-model="clearing" title="Clearing" />
      <input type="checkbox" v-model="pipeline" title="Pipeline" />
      <input
        type="range"
        v-model.number="alpha"
        max="1"
        min="0"
        step="0.001"
        class="group-alpha"
      />
      <select v-model="compositeOperation" class="group-composite-operation">
        <optgroup
          v-for="group in compositeOperations"
          :label="group.label"
          :key="group.label"
        >
          <option
            v-for="mode in group.children"
            :value="mode.value"
            :key="mode.label"
            >{{ mode.label }}</option
          >
        </optgroup>
      </select>
    </section>
    <section class="group-body">
      <div class="group-title" contenteditable="false">{{ name }}</div>
      <Container
        drag-handle-selector=".handle"
        orientation="horizontal"
        group-name="modules"
        :should-animate-drop="() => false"
        :get-child-payload="getChildPayload"
        tag="div"
        class="group-modules"
        @drop="onDrop"
      >
        <Draggable
          v-for="moduleId in modules"
          :key="moduleId"
          class="group-module"
        >
          <div class="group-module-container">
            <ActiveModule :id="moduleId" />
          </div>
        </Draggable>
      </Container>
    </section>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import ActiveModule from "./ActiveModule";
import compositeOperations from "../util/composite-operations";

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
  props: {
    groupId: {
      type: String,
      required: true
    }
  },

  components: {
    ActiveModule,
    Container,
    Draggable
  },

  data() {
    return {
      compositeOperations
    };
  },

  computed: {
    group() {
      return this.$modV.store.state.groups.groups.filter(
        group => group.id === this.groupId
      )[0];
    },

    name() {
      return this.group.name;
    },

    modules: {
      get() {
        return this.group.modules;
      },

      set(modules) {
        this.$modV.store.commit("groups/REPLACE_GROUP_MODULES", {
          groupId: this.groupId,
          modules
        });
      }
    },

    focused() {
      return this.groupId === this.$store.state["ui-groups"].focused;
    },

    enabled: {
      get() {
        return this.group.enabled;
      },

      set(value) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            enabled: value
          }
        });
      }
    },

    inherit: {
      get() {
        return this.group.inherit;
      },

      set(value) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            inherit: value
          }
        });
      }
    },

    pipeline: {
      get() {
        return this.group.pipeline;
      },

      set(value) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            pipeline: value
          }
        });
      }
    },

    clearing: {
      get() {
        return this.group.clearing;
      },

      set(value) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            clearing: value
          }
        });
      }
    },

    alpha: {
      get() {
        return this.group.alpha;
      },

      set(value) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            alpha: value
          }
        });
      }
    },

    compositeOperation: {
      get() {
        return this.group.compositeOperation;
      },

      set(value) {
        console.log(value);
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            compositeOperation: value
          }
        });
      }
    }
  },

  methods: {
    async onDrop(e) {
      const { moduleName, collection } = e.payload;

      if (e.addedIndex === null && e.removedIndex === null) {
        return;
      }

      if (collection === "gallery") {
        const module = await this.$modV.store.dispatch(
          "modules/makeActiveModule",
          { moduleName }
        );

        this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
          moduleId: module.$id,
          groupId: this.groupId,
          position: e.addedIndex
        });
      } else if (collection === "layer") {
        e.payload = e.payload.moduleId;
        this.modules = applyDrag(this.modules, e);
      }
    },

    getChildPayload(e) {
      const moduleId = this.modules[e];

      return { moduleId, collection: "layer" };
    },

    focus() {
      if (!this.focused) {
        this.$store.commit("ui-groups/SET_FOCUSED", this.groupId);
      }
    }
  }
};
</script>

<style scoped>
div.group {
  display: flex;
  max-width: 100%;
  margin-bottom: 10px;
}

section.group-body {
  flex: 1;
  overflow: hidden;
}

section.group-controls {
  display: flex;
  flex-direction: column;
}

.focused div.group-title {
  background-color: rgba(255, 138, 101, 0.6);
}

div.group-title {
  padding: 10px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
}

.focused div.group-modules {
  background-color: rgba(191, 54, 12, 0.6);
}

div.group-modules {
  display: flex;
  overflow-x: auto;
  min-height: 60px;
  background-color: rgba(90, 90, 90, 0.6);
}

div.group-module {
  min-height: 80px;
  position: relative;
}

div.group-module:not(:last-child) {
  margin-right: 20px;
}

div.group-module:not(:last-child)::after {
  content: "→";
  position: absolute;
  top: 0;
  right: -14px;
  height: 100%;
  display: flex;
  align-items: center;
}

div.group-module-container {
  background-color: rgba(90, 90, 90, 0.6);
  width: 300px;
}

input.group-alpha {
  -webkit-appearance: slider-vertical;
  width: 13px;
}

select.group-composite-operation {
  width: 13px;
}
</style>
