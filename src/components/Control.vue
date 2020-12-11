<template>
  <grid
    columns="4"
    @mousedown="focusInput"
    :class="{ 'has-link': hasLink, focused: inputIsFocused }"
  >
    <c span="1">
      <label v-context-menu="menuOptions">{{ title }}</label>
    </c>
    <c span="3">
      <div class="input" v-if="component">
        <component :is="component" v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'int' || type === 'float'">
        <RangeControl
          :min="min"
          :max="max"
          v-model.number="value"
          :type="type"
        />
      </div>
      <div class="input" v-else-if="type === 'tween'">
        <TweenControl v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'vec2'">
        <Vec2DControl v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'text'">
        <input type="text" v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'bool'">
        <Checkbox :class="{ light: !inputIsFocused }" v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'color'">
        <ColorControl v-model="value" :moduleId="id" :prop="prop" />
      </div>
      <div class="input" v-else-if="type === 'texture'">
        <TextureControl v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'enum'">
        <select v-model="value">
          <option
            v-for="(option, index) in activeProp.enum"
            :value="option.value"
            :key="index"
            :selected="option.selected"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </c>
  </grid>
</template>

<script>
import RangeControl from "./Controls/RangeControl";
import Vec2DControl from "./Controls/Vec2DControl";
import TweenControl from "./Controls/TweenControl";
import PaletteControl from "./Controls/PaletteControl";
import TextureControl from "./Controls/TextureControl";
import FontControl from "./Controls/FontControl";
import ColorControl from "./Controls/ColorControl";
import hasLink from "./mixins/has-input-link";
import inputIsFocused from "./mixins/input-is-focused";

export default {
  mixins: [hasLink, inputIsFocused],

  props: ["id", "prop"],

  components: {
    RangeControl,
    Vec2DControl,
    TweenControl,
    PaletteControl,
    TextureControl,
    FontControl,
    ColorControl
  },

  data() {
    return {
      queued: 0,
      dirty: false,
      raf: null,

      modeStep: 0.01,
      menuOptions: {
        match: ["control"],
        menuItems: []
      }
    };
  },

  methods: {
    async queueLoop() {
      const { id, prop, queued } = this;

      await this.$modV.store.dispatch("modules/updateProp", {
        moduleId: id,
        prop,
        data: queued
      });

      this.queued = null;
      this.dirty = false;
    },

    focusInput() {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: this.inputId,
        title: `${this.moduleName}: ${this.title}`
      });
    }
  },

  computed: {
    activeProp() {
      const { id, prop } = this;
      return this.$modV.store.state.modules.active[id].$props[prop];
    },

    moduleName() {
      const { id } = this;
      return this.$modV.store.state.modules.active[id].meta.name;
    },

    inputId() {
      return this.activeProp.id;
    },

    type() {
      return this.activeProp.type;
    },

    min() {
      return this.activeProp.min;
    },

    max() {
      return this.activeProp.max;
    },

    title() {
      return this.activeProp.label || this.prop;
    },

    component() {
      return this.activeProp.component || false;
    },

    value: {
      get() {
        const { id, prop, type } = this;
        const propData = this.$modV.store.state.modules.active[id].props[prop];

        if (type === "tween") {
          return this.$modV.store.state.tweens.tweens[propData.id];
        }

        return propData;
      },

      set(value) {
        this.queued = value;
        this.dirty = true;
      }
    }
  },

  watch: {
    dirty(value) {
      if (value) {
        this.raf = requestAnimationFrame(this.queueLoop);
      }
    }
  }
};
</script>

<style scoped>
grid {
  padding: 8px;
  margin: 0 !important;
}

.has-link {
  background: rgba(255, 199, 0, 0.7);
}

.focused {
  background: #363636;
}

.has-link.focused {
  background: rgba(255, 199, 0, 0.9);
}

label {
  display: flex;
}

input[type="number"] {
  width: 30%;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 2px 3px;
}
</style>
