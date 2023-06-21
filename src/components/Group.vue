<template>
  <div
    class="group"
    :id="`group-${groupId}`"
    v-searchTerms="{
      terms: ['group'],
      title: name,
      type: 'Group',
      focusElement: true
    }"
    tabindex="0"
    @keydown.self="removeGroup"
    @focus.self="focus"
    @mousedown.self="focus"
    :class="{ focused }"
  >
    <div
      class="group__controls"
      :class="{ 'group__controls-hidden': !controlsShown }"
    >
      <grid columns="6">
        <c span="1..">
          <grid
            columns="6"
            @mousedown="focusInput(group.enabledInputId, 'Enable')"
            :class="{
              'has-link': hasLink(group.enabledInputId),
              focused: isFocused(group.enabledInputId)
            }"
          >
            <c span="2">Enable</c>
          </grid>
        </c>

        <c span="1..">
          <grid
            columns="6"
            @mousedown="focusInput(group.inheritInputId, 'Inherit')"
            :class="{
              'has-link': hasLink(group.inheritInputId),
              focused: isFocused(group.inheritInputId)
            }"
          >
            <c span="2">Inherit</c>
            <c span="4">
              <Select
                v-model="inheritanceSelection"
                class="group__inheritSelect"
                :class="{ light: isFocused(group.inheritInputId) }"
              >
                <option :value="-2">Don't Inherit</option>
                <option :value="-1">Previous Group</option>
                <option
                  v-for="group in groups"
                  :key="group.id"
                  :value="group.id"
                  >{{ group.name }}</option
                >
              </Select>
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid
            columns="6"
            @mousedown="focusInput(group.clearingInputId, 'Clearing')"
            :class="{
              'has-link': hasLink(group.clearingInputId),
              focused: isFocused(group.clearingInputId)
            }"
          >
            <c span="2">Clearing</c>
            <c span="4">
              <Checkbox
                v-model="clearing"
                class="group__clearingCheckbox"
                :class="{ light: isFocused(group.clearingInputId) }"
              />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid
            columns="6"
            @mousedown="focusInput(group.pipelineInputId, 'Pipeline')"
            :class="{
              'has-link': hasLink(group.pipelineInputId),
              focused: isFocused(group.pipelineInputId)
            }"
          >
            <c span="2">Pipeline</c>
            <c span="4">
              <Checkbox
                v-model="pipeline"
                class="group__pipelineCheckbox"
                :class="{ light: isFocused(group.pipelineInputId) }"
              />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid
            columns="6"
            @mousedown="focusInput(group.alphaInputId, 'Alpha')"
            :class="{
              'has-link': hasLink(group.alphaInputId),
              focused: isFocused(group.alphaInputId)
            }"
          >
            <c span="2">Alpha</c>
            <c span="4">
              <Range
                class="group__alphaRange"
                value="1"
                max="1"
                step="0.001"
                v-model="alpha"
              />
            </c>
          </grid>
        </c>

        <c span="1..">
          <grid
            columns="6"
            @mousedown="
              focusInput(group.compositeOperationInputId, 'Blend Mode')
            "
            :class="{
              'has-link': hasLink(group.compositeOperationInputId),
              focused: isFocused(group.compositeOperationInputId)
            }"
          >
            <c span="2">Blend</c>
            <c span="4">
              <Select
                v-model="blendMode"
                class="group__blendModeSelect"
                :class="{ light: isFocused(group.compositeOperationInputId) }"
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
              </Select>
            </c>
          </grid>
        </c>

        <!-- <c span="1..">
          <grid columns="6">
            <c span="2">Quality</c>
            <c span="4">
              <Select v-model="quality">
                <option value="full">Full</option>
                <option value="half">Half</option>
                <option value="quarter">Quarter</option>
                <option value="bad">Bad</option>
                <option value="awful">Awful</option>
              </Select>
            </c>
          </grid>
        </c>-->
      </grid>
    </div>
    <div class="group__left">
      <Checkbox
        class="group__enabledCheckbox"
        v-model="enabled"
        allowPartial="true"
        title="alt-click to skip drawing to output canvas"
      />
      <button
        class="group__controlsButton"
        :class="{ 'group__controlsButton-hidden': !controlsShown }"
        @click="controlsShown = !controlsShown"
      >
        <img :src="Arrow" />
      </button>
    </div>
    <div class="group__right">
      <div
        class="group__name"
        :class="{ grabbing }"
        @click.self="endNameEditable"
        @mousedown="titleMouseDown"
      >
        <span v-if="!nameEditable" @dblclick="toggleNameEditable">{{
          name
        }}</span>
        <TextInput
          v-model="localName"
          ref="nameInput"
          v-else
          @keypress.enter="endNameEditable"
        />
      </div>
      <figure
        class="group__focusIndicator"
        v-show="lastFocusedGroup"
        title="Focused Group"
      ></figure>
      <Container
        drag-handle-selector=".handle"
        orientation="horizontal"
        group-name="modules"
        :should-animate-drop="() => false"
        :get-child-payload="getChildPayload"
        tag="div"
        class="group__modules"
        @drop="onDrop"
      >
        <Draggable
          v-for="moduleId in localModules"
          :key="moduleId"
          class="group__module"
        >
          <div class="group-module-container">
            <ActiveModule :id="moduleId" @remove-module="removeModule" />
          </div>
        </Draggable>
      </Container>
    </div>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import constants from "../application/constants";
import ActiveModule from "./ActiveModule";
import compositeOperations from "../util/composite-operations";
import Arrow from "../assets/graphics/Arrow.svg";

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
      nameEditable: false,
      localName: "",
      controlsShown: false,
      Arrow,
      inheritanceSelection: -1,
      grabbing: false,
      localModules: []
    };
  },

  created() {
    this.localName = this.name;
    this.localModules = this.modules;
    this.inheritanceSelection = !this.inherit ? -2 : this.inheritFrom;

    if (!this.focusedGroup) {
      this.focus();
    }
  },

  beforeDestroy() {
    window.removeEventListener("mousedown", this.endNameEditable);
  },

  computed: {
    groups() {
      return this.$modV.store.state.groups.groups.filter(
        group => group.name !== constants.GALLERY_GROUP_NAME
      );
    },
    group() {
      return this.groups.filter(group => group.id === this.groupId)[0];
    },

    name() {
      return this.group.name;
    },

    modules: {
      get() {
        return this.group.modules;
      },

      set(modules) {
        // localModules is used to avoid a UI jump as we wait for the worker to
        // send back the updated order
        this.localModules = modules;
        this.$modV.store.commit("groups/REPLACE_GROUP_MODULES", {
          groupId: this.groupId,
          modules
        });
      }
    },

    focusedGroup() {
      return this.$store.state["focus"].type === "group";
    },

    focused() {
      return (
        this.focusedGroup && this.groupId === this.$store.state["focus"].id
      );
    },

    lastFocusedGroup() {
      return this.$store.state["ui-groups"].lastFocused === this.groupId;
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

    inheritFrom() {
      return this.group.inheritFrom;
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

    blendMode: {
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
        this.$store.dispatch("focus/setFocus", {
          id: this.groupId,
          type: "group"
        });
      }

      this.$store.commit("ui-groups/SET_LAST_FOCUSED", this.groupId);
    },

    removeModule(moduleId) {
      const { groupId } = this;

      this.$modV.store.commit("groups/REMOVE_MODULE_FROM_GROUP", {
        moduleId,
        groupId
      });

      this.$modV.store.dispatch("modules/removeActiveModule", {
        moduleId
      });

      if (this.focused) {
        this.$store.commit("ui-groups/CLEAR_LAST_FOCUSED");
      }
    },

    toggleNameEditable() {
      this.nameEditable = !this.nameEditable;

      if (this.nameEditable) {
        window.addEventListener("mousedown", this.endNameEditable);
        this.$nextTick(() => {
          this.$refs.nameInput.$el.focus();
          this.$refs.nameInput.$el.select();
        });
      }
    },

    endNameEditable(e) {
      if (e instanceof MouseEvent && e.target === this.$refs.nameInput.$el) {
        return;
      }

      window.removeEventListener("mousedown", this.endNameEditable);

      const { localName } = this;
      const trimmedName = localName.trim();

      if (trimmedName.length > 0) {
        this.$modV.store.dispatch("groups/updateGroupName", {
          groupId: this.groupId,
          name: trimmedName
        });
      } else {
        this.localName = this.name;
      }

      this.nameEditable = false;
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
    },

    removeGroup(e) {
      if (e.keyCode === 8 || e.keyCode === 46) {
        this.$modV.store.dispatch("groups/removeGroup", {
          groupId: this.groupId
        });
      }
    },

    titleMouseDown() {
      this.grabbing = true;
      window.addEventListener("mouseup", this.titleMouseUp);
    },

    titleMouseUp() {
      this.grabbing = false;
      window.removeEventListener("mouseup", this.titleMouseUp);
    }
  },

  watch: {
    name(value) {
      this.localName = value;
    },

    modules(value) {
      this.localModules = value;
    },

    inheritanceSelection(value) {
      const inheritFrom = value.length === 2 ? parseInt(value) : value;

      if (inheritFrom === -2) {
        this.inherit = false;
      } else {
        this.inherit = true;

        this.$modV.store.commit("groups/UPDATE_GROUP", {
          groupId: this.groupId,
          data: {
            inheritFrom
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.group {
  font-size: 14px;
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}

.group:focus,
.group.focused {
  outline: #c4c4c4 2px solid;
}

.group__body {
  display: flex;
  width: 100%;
}

.group__left {
  background: #363636;
  box-sizing: border-box;
  display: flex;
  padding: 8px;
  width: 32px;

  flex-direction: column;
}

.group__right {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.group__enabledCheckbox {
  position: relative;
  z-index: 1;
}

.group__controlsButton {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  height: 100%;
  margin-top: -16px;

  display: flex;
  align-items: center;
}

.group__controlsButton:focus {
  outline: none;
}

.group__controlsButton-hidden {
  transform: rotate(180deg);
}

.group__modules {
  background: #484848;
  padding: 8px;
  overflow-x: scroll;
  white-space: nowrap;
  display: block !important;
  flex: 1;
}

.group__module {
  display: inline-block !important;
}

.group__modules > * {
  flex-shrink: 0;
  display: inline-block;
}

.group__modules > * + * {
  position: relative;
  margin-left: 24px;
}

.group__modules > * + *:not(.smooth-dnd-ghost)::before {
  background-image: url(../assets/graphics/Arrow.svg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50%;

  content: "";
  position: absolute;
  transform: rotate(180deg);
  left: -18px;
  height: 100%;
  width: 13px;
  display: flex;
  align-items: center;
}

.group__name {
  background: #363636;
  color: white;
  padding: 8px;
  line-height: 1;
  cursor: grab;
}

.group__name.grabbing {
  cursor: grabbing;
}

.group__name input {
  max-width: 120px;
}

.group__focusIndicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
}

.group__controls {
  background: #363636;
  color: white;
  padding: 0;
  box-sizing: border-box;
  flex-shrink: 0;
}

.group__controls grid {
  grid-row-gap: 0;
  grid-column-gap: 0;
}

.group__controls c {
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.group__controls > grid {
  padding: 4px 0;
}

.group__controls c grid {
  padding: 4px 8px;
  width: 100%;
}

.group__controls .focused {
  background: #151515;
  color: #ffffff;
}

.group__controls-hidden {
  padding-left: 0;
  padding-right: 0;
  width: 0;
  overflow: hidden;
}
</style>
