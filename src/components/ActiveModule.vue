<template>
  <div
    class="active-module"
    tabindex="0"
    @keydown="removeModule"
    @focus="clickActiveModule"
    ref="activeModule"
    :class="{ focused }"
    v-contextMenu="
      () => ActiveModuleContextMenu({ activeModule: module, groupId })
    "
    :id="`active-module-${id}`"
  >
    <div
      class="active-module__name handle"
      :class="{ grabbing }"
      @mousedown.left="titleMouseDown"
    >
      {{ name }}

      <TooltipDisplay
        class="active-module__status"
        v-if="statusMessages.length"
        :message="statusMessages"
        >⚠️</TooltipDisplay
      >
    </div>
    <grid class="active-module__controls" columns="6">
      <c span="1..">
        <grid
          columns="6"
          @mousedown="
            focusInput(module && module.meta.enabledInputId, 'Enable')
          "
          :class="{
            'has-link': hasLink(module && module.meta.enabledInputId),
            focused: isFocused(module && module.meta.enabledInputId)
          }"
        >
          <c span="2">Enable</c>
          <c span="4"><Checkbox v-model="enabled"/></c>
        </grid>
      </c>

      <c span="1..">
        <grid
          columns="6"
          @mousedown="focusInput(module && module.meta.alphaInputId, 'Alpha')"
          :class="{
            'has-link': hasLink(module && module.meta.alphaInputId),
            focused: isFocused(module && module.meta.alphaInputId)
          }"
        >
          <c span="2">Alpha</c>
          <c span="4" class="active-module__alpha-input">
            <Range
              value="1"
              min="0"
              max="1"
              step="0.001"
              v-model.number="alpha"
            />
          </c>
        </grid>
      </c>

      <c span="1..">
        <grid
          columns="6"
          @mousedown="
            focusInput(
              module && module.meta.compositeOperationInputId,
              'Blend Mode'
            )
          "
          :class="{
            'has-link': hasLink(
              module && module.meta.compositeOperationInputId
            ),
            focused: isFocused(module && module.meta.compositeOperationInputId)
          }"
        >
          <c span="2">Blend</c>
          <c span="4">
            <Select v-model="blendMode">
              <optgroup
                v-for="group in blendModes"
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
    </grid>
  </div>
</template>

<script>
import blendModes from "../util/composite-operations";
import { ActiveModuleContextMenu } from "../menus/context/activeModuleContextMenu";
import TooltipDisplay from "./TooltipDisplay.vue";

export default {
  props: ["id", "groupId"],

  components: {
    TooltipDisplay
  },

  data() {
    return {
      ActiveModuleContextMenu,
      blendModes,
      showMore: false,
      grabbing: false
    };
  },

  beforeDestroy() {
    // ensure listener cleanup
    this.titleMouseUp();
  },

  computed: {
    module() {
      return this.$modV.store.state.modules.active[this.id];
    },

    alpha: {
      get() {
        if (!this.module) {
          return 1;
        }

        return this.module.meta.alpha;
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "alpha",
          data: value
        });
      }
    },

    blendMode: {
      get() {
        if (!this.module) {
          return "normal";
        }

        return this.module.meta.compositeOperation || "normal";
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "compositeOperation",
          data: value
        });
      }
    },

    enabled: {
      get() {
        if (!this.module) {
          return false;
        }

        return this.module.meta.enabled;
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "enabled",
          data: value
        });
      }
    },

    name() {
      if (!this.module) {
        return "";
      }

      return this.module.meta.name;
    },

    focusedModule() {
      return this.$store.state["focus"].type === "module";
    },

    focused() {
      return this.focusedModule && this.id === this.$store.state["focus"].id;
    },

    statusMessages() {
      const messages = (this.module.$status || []).reduce(
        (prev, status) => `${prev} ${status.message}`.trim(),
        ""
      );

      return messages;
    }
  },

  methods: {
    focusInput(id, title) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id,
        title: `${this.module && this.module.meta.name}: ${title}`
      });
    },

    async clickActiveModule() {
      await this.$store.dispatch("focus/setFocus", {
        id: this.id,
        type: "module"
      });

      this.$store.commit("ui-modules/SET_FOCUSED", this.id);
    },

    hasLink(id) {
      return this.$modV.store.state.inputs.inputLinks[id];
    },

    isFocused(id) {
      return this.$modV.store.state.inputs.focusedInput.id === id;
    },

    async removeModule(e) {
      if (e.keyCode === 8 || e.keyCode === 46) {
        this.$store.commit("ui-modules/SET_FOCUSED", null);
        await this.$modV.store.dispatch("inputs/clearFocusedInput");

        this.$emit("remove-module", this.id);
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
  }
};
</script>

<style scoped>
.active-module {
  color: #000;
  width: 200px;
  font-size: 14px;
}

.active-module:focus,
.active-module.focused {
  outline: #c4c4c4 2px solid;
}

.active-module__name {
  background: #9a9a9a;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  cursor: grab;
}

.active-module__name.grabbing {
  cursor: grabbing;
}

.active-module__controls,
.active-module__controls grid {
  grid-row-gap: 0;
  grid-column-gap: 0;
  background: #e5e5e5;
}

.active-module__controls grid,
.active-module__name {
  box-sizing: border-box;
  padding: 0 4px;
}

.active-module__controls grid c {
  display: inline-flex;
  align-items: center;
}

.active-module__controls .focused {
  background: #363636;
  color: #ffffff;
}

.active-module__status {
  background-color: #9a9a9a;
  display: inline-block;
  position: absolute;
  top: 0;
  right: 4px;
}
</style>

<style>
body .active-module .animated .handle {
  cursor: -webkit-grabbing !important;
}
</style>
