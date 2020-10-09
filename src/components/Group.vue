<template>
  <div
    v-searchTerms="{
      terms: ['group'],
      title: name,
      type: 'Group',
      focusElement: true
    }"
    @focus="focus"
    @mousedown="focus"
    :class="{ focused }"
    class="group"
  >
    <section class="group-controls">
      <input
        type="checkbox"
        v-model="enabled"
        title="Enabled"
        @mousedown="focusInput(group.enabledInputId, 'Enabled')"
        :class="{
          'has-link': hasLink(group.enabledInputId),
          focused: isFocused(group.enabledInputId)
        }"
      />
      <input
        type="checkbox"
        v-model="inherit"
        title="Inherit"
        @mousedown="focusInput(group.inheritInputId, 'Inherit')"
        :class="{
          'has-link': hasLink(group.inheritInputId),
          focused: isFocused(group.inheritInputId)
        }"
      />
      <input
        type="checkbox"
        v-model="clearing"
        title="Clearing"
        @mousedown="focusInput(group.clearingInputId, 'Clearing')"
        :class="{
          'has-link': hasLink(group.clearingInputId),
          focused: isFocused(group.clearingInputId)
        }"
      />
      <input
        type="checkbox"
        v-model="pipeline"
        title="Pipeline"
        @mousedown="focusInput(group.pipelineInputId, 'Pipeline')"
        :class="{
          'has-link': hasLink(group.pipelineInputId),
          focused: isFocused(group.pipelineInputId)
        }"
      />
      <input
        type="range"
        v-model.number="alpha"
        max="1"
        min="0"
        step="0.001"
        class="group-alpha"
        @mousedown="focusInput(group.alphaInputId, 'Alpha')"
        :class="{
          'has-link': hasLink(group.alphaInputId),
          focused: isFocused(group.alphaInputId)
        }"
      />
      <select
        v-model="compositeOperation"
        class="group-composite-operation"
        @mousedown="
          focusInput(group.compositeOperationInputId, 'Composite Operation')
        "
        :class="{
          'has-link': hasLink(group.compositeOperationInputId),
          focused: isFocused(group.compositeOperationInputId)
        }"
      >
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
      <div class="group-title" @click.self="endTitleEditable">
        <span v-if="!titleEditable" @dblclick="toggleTitleEditable">{{
          name
        }}</span>
        <input
          type="text"
          v-model="localName"
          v-else
          @keypress.enter="endTitleEditable"
        />
      </div>
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
            <ActiveModule :id="moduleId" @remove-module="removeModule" />
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
      compositeOperations,
      titleEditable: false,
      localName: ""
    };
  },

  created() {
    this.localName = this.name;

    if (!this.focusedGroup) {
      this.focus();
    }
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

    focusedGroup() {
      return this.$store.state["ui-groups"].focused;
    },

    focused() {
      return this.groupId === this.focusedGroup;
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
    },

    removeModule(moduleId) {
      const { groupId } = this;

      this.$modV.store.commit("groups/REMOVE_MODULE_FROM_GROUP", {
        moduleId,
        groupId
      });

      this.$modV.store.commit("modules/REMOVE_ACTIVE_MODULE", {
        moduleId
      });
    },

    toggleTitleEditable() {
      this.titleEditable = !this.titleEditable;
    },

    endTitleEditable() {
      const { localName } = this;
      const trimmedName = localName.trim();

      if (trimmedName.length > 0) {
        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            name: trimmedName
          }
        });
      } else {
        this.localName = this.name;
      }

      this.titleEditable = false;
    },

    focusInput(id, title) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id,
        title: `${this.name}: ${title}`
      });
    },
    hasLink(id) {
      return this.$modV.store.state.inputs.inputLinks[id];
    },

    isFocused(id) {
      return this.$modV.store.state.inputs.focusedInput.id === id;
    }
  },

  watch: {
    name(value) {
      this.localName = value;
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
  border-radius: 8px;
  overflow: hidden;
}

section.group-controls {
  display: flex;
  flex-direction: column;
}

.focused div.group-title {
  background-color: var(--foreground-color-3);
  color: var(--foreground-color);
}

div.group-title {
  padding: var(--baseline);
  width: 100%;
  background-color: var(--foreground-color-3);
  color: var(--foreground-color-2);
  box-sizing: border-box;
}

.focused div.group-modules {
  background-color: var(--foreground-color-2);
}

div.group-modules {
  display: flex;
  overflow-x: auto;
  min-height: 174px;
  background-color: var(--foreground-color-3);
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
  background-color: var(--foreground-color-3);
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
