<template>
  <label v-context-menu="menuOptions">
    <div class="label">{{ title }}</div>
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
  </label>
</template>

<script>
import RangeControl from "./Controls/RangeControl";
import Vec2DControl from "./Controls/Vec2DControl";
import TweenControl from "./Controls/TweenControl";
import PaletteControl from "./Controls/PaletteControl";

export default {
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
    }
  },

  computed: {
    activeProp() {
      const { id, prop } = this;
      return this.$modV.store.state.modules.active[id].props[prop];
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
        const { id, prop } = this;
        return this.$modV.store.state.modules.active[id][prop];
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
label {
  display: flex;
  margin-bottom: 5px;
}

div.label {
  width: 40%;
}

div.input {
  width: 60%;
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
