<template>
  <grid
    columns="4"
    @mousedown="focusInput"
    :class="{ 'has-link': hasLink, focused: inputIsFocused }"
    :id="`module-control-${inputId}`"
  >
    <c span="1">
      <label>{{ title }}</label>
    </c>
    <c span="3">
      <div class="input" v-if="component">
        <component :is="component" v-model="internalValue" />
      </div>
      <div class="input" v-else-if="type === 'int' || type === 'float'">
        <RangeControl
          :min="min"
          :max="max"
          :step="step"
          v-model.number="internalValue"
          :type="type"
        />
      </div>
      <div class="input" v-else-if="type === 'tween'">
        <TweenControl v-model="internalValue" />
      </div>
      <div class="input" v-else-if="type === 'vec2'">
        <Vec2DControl
          v-model="internalValue"
          :inputId="inputId"
          :inputTitle="inputTitle"
        />
      </div>
      <div class="input" v-else-if="type === 'vec3'">
        <Vec3Control
          v-model="internalValue"
          :inputId="inputId"
          :inputTitle="inputTitle"
        />
      </div>
      <div class="input" v-else-if="type === 'vec4'">
        <Vec4Control
          v-model="internalValue"
          :inputId="inputId"
          :inputTitle="inputTitle"
        />
      </div>
      <div class="input" v-else-if="type === 'text'">
        <input type="text" v-model="internalValue" />
      </div>
      <div class="input" v-else-if="type === 'bool'">
        <Checkbox
          :class="{ light: !inputIsFocused }"
          v-model="internalValue"
          :emitBoolean="true"
        />
      </div>
      <div class="input" v-else-if="type === 'color'">
        <ColorControl
          v-model="internalValue"
          :moduleId="moduleId"
          :inputId="inputId"
          :inputTitle="inputTitle"
          :prop="prop"
        />
      </div>
      <div class="input" v-else-if="type === 'texture'">
        <TextureControl v-model="internalValue" />
      </div>
      <div class="input" v-else-if="type === 'enum'">
        <Select v-model="internalValue">
          <option
            v-for="(option, index) in activeProp.enum"
            :value="option.value"
            :key="index"
            :selected="option.selected"
            >{{ option.label }}</option
          >
        </Select>
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
import Vec3Control from "./Controls/Vec3Control";
import Vec4Control from "./Controls/Vec4Control";
import hasLink from "./mixins/has-input-link";
import inputIsFocused from "./mixins/input-is-focused";
import Select from "./inputs/Select.vue";

export default {
  mixins: [hasLink, inputIsFocused],

  props: {
    inputTitle: {
      type: String,
      default: ""
    },

    title: {
      type: String,
      required: true
    },

    value: {
      required: true
    },

    activeProp: {
      type: Object,
      required: true
    },

    moduleId: {
      type: String,
      required: false
    },

    prop: {
      type: String,
      required: false
    }
  },

  components: {
    RangeControl,
    Vec2DControl,
    TweenControl,
    PaletteControl,
    TextureControl,
    FontControl,
    ColorControl,
    Vec3Control,
    Vec4Control,
    Select
  },

  data() {
    return {
      queued: 0,
      dirty: false,
      raf: null,

      modeStep: 0.01
    };
  },

  methods: {
    async queueLoop() {
      const { queued } = this;

      this.$emit("input", queued);

      this.queued = null;
      this.dirty = false;
    },

    focusInput() {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: this.inputId,
        title: this.inputTitle
      });
    }
  },

  computed: {
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

    step() {
      return this.activeProp.step;
    },

    component() {
      return this.activeProp.component || false;
    },

    internalValue: {
      get() {
        return this.value;
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

.input {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
