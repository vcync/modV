<template>
  <div
    class="active-module"
    ref="activeModule"
    tabindex="0"
    @keydown="removeModule"
  >
    <grid
      columns="4"
      class="head padded-grid"
      @click="clickActiveModule(module.meta.enabledInputId, 'Enabled')"
      :class="{
        'has-link': hasLink(module.meta.enabledInputId),
        focused: isFocused(module.meta.enabledInputId)
      }"
    >
      <c class="checkbox">
        <input type="checkbox" v-model="enabled" :id="id" />
      </c>
      <c span="2" class="label">
        <label :for="id">{{ name }}</label>
      </c>

      <c class="show-more">
        <grid columns="2">
          <c>
            <div class="handle"></div>
          </c>
          <c>
            <button @click="showMore = !showMore">
              {{ showMore ? "▲" : "▼" }}
            </button>
          </c>
        </grid>
      </c>
    </grid>

    <grid class="controls">
      <c span="1..">
        <grid
          columns="4"
          class="padded-grid"
          @click="focusInput(module.meta.alphaInputId, 'Alpha')"
          :class="{
            'has-link': hasLink(module.meta.alphaInputId),
            focused: isFocused(module.meta.alphaInputId)
          }"
        >
          <c span="2">
            <label>Alpha</label>
          </c>
          <c span="2">
            <input type="range" v-model="alpha" min="0" max="1" step="0.01" />
          </c>
        </grid>
      </c>

      <c span="1..">
        <grid
          columns="4"
          class="padded-grid"
          @click="
            focusInput(
              module.meta.compositeOperationInputId,
              'Composite Operation'
            )
          "
          :class="{
            'has-link': hasLink(module.meta.compositeOperationInputId),
            focused: isFocused(module.meta.compositeOperationInputId)
          }"
        >
          <c span="2"><label>Blend</label></c>
          <c span="2">
            <select class="blend-controls" v-model="blendMode">
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
            </select>
          </c>
        </grid>
      </c>

      <c span="1.." v-if="module.props && showMore">
        <Control
          class="padded-grid"
          v-for="key in getProps(module.$moduleName)"
          :id="id"
          :prop="key"
          :key="key"
        />
      </c>
    </grid>
  </div>
</template>

<script>
import Control from "@/components/Control";
import blendModes from "../util/composite-operations";
export default {
  props: ["id"],

  data() {
    return {
      blendModes,
      showMore: false
    };
  },

  computed: {
    module() {
      return this.$modV.store.state.modules.active[this.id];
    },

    alpha: {
      get() {
        return this.$modV.store.state.modules.active[this.id].meta.alpha;
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
        return (
          this.$modV.store.state.modules.active[this.id].meta
            .compositeOperation || "normal"
        );
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
        return this.$modV.store.state.modules.active[this.id].meta.enabled;
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
      return this.module.meta.name;
    }
  },

  components: {
    Control
  },

  methods: {
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
          moduleDefinition.props[key].type === "tween" ||
          moduleDefinition.props[key].type === "texture" ||
          moduleDefinition.props[key].type === "enum"
      );
    },

    focusInput(id, title) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id,
        title: `${this.module.meta.name}: ${title}`
      });
    },

    clickActiveModule(inputId, title) {
      this.focusInput(inputId, title);
      this.$refs.activeModule.focus();
      this.$store.commit("ui-modules/SET_FOCUSED", this.id);
    },

    hasLink(id) {
      return this.$modV.store.state.inputs.inputLinks[id];
    },

    isFocused(id) {
      return this.$modV.store.state.inputs.focusedInput.id === id;
    },

    removeModule(e) {
      if (e.keyCode === 8 || e.keyCode === 46) {
        this.$store.commit("ui-modules/SET_FOCUSED", null);
        this.$emit("remove-module", this.id);
      }
    }
  }
};
</script>

<style scoped>
.has-link {
  border: 1px solid rgba(255, 217, 0, 0.3);
}

.focused {
  background-color: rgba(0, 0, 0, 0.3);
}

.padded-grid {
  padding: 0.75em 0.75em;
}

.blend-controls {
  max-width: 100%;
}

.active-module .head {
  display: flex;
}

.active-module .head .label {
  flex-grow: 1;
  margin: 0 5px;
}

.active-module .show-more {
  align-self: flex-end;
}

input[type="checkbox"] {
  margin: 0;
}

.handle {
  vertical-align: middle;
  width: 16px;
  height: 16px;
  border: 1px solid;
  border-radius: 50%;
  cursor: -webkit-grab;
}
</style>

<style>
body .active-module .animated .handle {
  cursor: -webkit-grabbing !important;
}
</style>
