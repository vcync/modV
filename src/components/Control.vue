<template>
  <grid
    columns="4"
    @click="focusInput"
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
        <RangeControl :min="min" :max="max" v-model.number="value" />
        <!-- <input
        type="range"
        :min="min"
        :max="max"
        v-model.number="value"
        step="0.01"
      /><input
        type="number"
        v-model.number="value"
        :step="modeStep"
        @keydown.shift="modeStep = 0.1"
        @keyup.shift="modeStep = 0.01"
      /> -->
      </div>
      <div class="input" v-else-if="type === 'tween'">
        <TweenControl v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'vec2'">
        <Vec2DControl v-model.number="value" />
      </div>
      <div class="input" v-else-if="type === 'text'">
        <input type="text" v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'bool'">
        <input type="checkbox" v-model="value" />
      </div>
      <div class="input" v-else-if="type === 'color'">
        <input type="color" v-model="value" />
      </div>
    </c>
  </grid>
</template>

<script>
import RangeControl from "./Controls/RangeControl";
import Vec2DControl from "./Controls/Vec2DControl";
import TweenControl from "./Controls/TweenControl";
import PaletteControl from "./Controls/PaletteControl";
import hasLink from "./mixins/has-input-link";
import inputIsFocused from "./mixins/input-is-focused";

export default {
  mixins: [hasLink, inputIsFocused],

  props: ["id", "prop"],

  components: {
    RangeControl,
    Vec2DControl,
    TweenControl,
    PaletteControl
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
    queueLoop() {
      this.dirty = false;
      const { id, prop, queued } = this;

      this.$modV.store.dispatch("modules/updateProp", {
        moduleId: id,
        prop,
        data: queued
      });
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
      return this.$modV.store.state.modules.active[id].props[prop];
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
        const propData = this.$modV.store.state.modules.active[id][prop];

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
  padding: 0.75em;
}

.has-link {
  border: 1px solid rgba(255, 217, 0, 0.3);
}

.focused {
  background-color: rgba(0, 0, 0, 0.3);
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
