<!-- eslint-disable vue/no-reserved-component-names -->
<template>
  <grid
    :id="`module-control-${inputId}`"
    columns="4"
    :class="{ 'has-link': hasLink, focused: inputIsFocused }"
    @mousedown="focusInput"
  >
    <c span="1">
      <label>{{ title }}</label>
    </c>
    <c span="3">
      <div v-if="component" class="input">
        <component :is="component" v-model="internalValue" />
      </div>
      <div v-else-if="type === 'int' || type === 'float'" class="input">
        <RangeControl
          v-model.number="internalValue"
          :min="min"
          :max="max"
          :step="step"
          :type="type"
        />
      </div>
      <div v-else-if="type === 'tween'" class="input">
        <TweenControl v-model="internalValue" />
      </div>
      <div v-else-if="type === 'vec2'" class="input">
        <Vec2DControl
          v-model="internalValue"
          :input-id="inputId"
          :input-title="inputTitle"
        />
      </div>
      <div v-else-if="type === 'vec3'" class="input">
        <Vec3Control
          v-model="internalValue"
          :input-id="inputId"
          :input-title="inputTitle"
        />
      </div>
      <div v-else-if="type === 'vec4'" class="input">
        <Vec4Control
          v-model="internalValue"
          :input-id="inputId"
          :input-title="inputTitle"
        />
      </div>
      <div v-else-if="type === 'text'" class="input">
        <input v-model="internalValue" type="text" />
      </div>
      <div v-else-if="type === 'bool'" class="input">
        <Checkbox
          v-model="internalValue"
          :class="{ light: !inputIsFocused }"
          :emit-boolean="true"
        />
      </div>
      <div v-else-if="type === 'color'" class="input">
        <ColorControl
          v-model="internalValue"
          :module-id="moduleId"
          :input-id="inputId"
          :input-title="inputTitle"
          :prop="prop"
        />
      </div>
      <div v-else-if="type === 'texture'" class="input">
        <TextureControl v-model="internalValue" />
      </div>
      <div v-else-if="type === 'enum'" class="input">
        <Select v-model="internalValue">
          <option
            v-for="(option, index) in activeProp.enum"
            :key="index"
            :value="option.value"
            :selected="option.selected"
          >
            {{ option.label }}
          </option>
        </Select>
      </div>
      <div v-else-if="type === 'event'" class="input">
        <Button
          :class="{ light: !inputIsFocused, active: !!internalValue }"
          @pointerdown="buttonDown"
          @pointerup="buttonUp"
        >
          {{ title }}
        </Button>
      </div>
    </c>
  </grid>
</template>

<script>
import RangeControl from "./Controls/RangeControl.vue";
import Vec2DControl from "./Controls/Vec2DControl.vue";
import TweenControl from "./Controls/TweenControl.vue";
import PaletteControl from "./Controls/PaletteControl.vue";
import TextureControl from "./Controls/TextureControl.vue";
import FontControl from "./Controls/FontControl.vue";
import ColorControl from "./Controls/ColorControl.vue";
import Vec3Control from "./Controls/Vec3Control.vue";
import Vec4Control from "./Controls/Vec4Control.vue";
import hasLink from "./mixins/has-input-link.js";
import inputIsFocused from "./mixins/input-is-focused.js";
import Select from "./inputs/Select.vue";
import Button from "./inputs/Button.vue";

export default {
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
    Select,
    Button,
  },

  mixins: [hasLink, inputIsFocused],

  props: {
    inputTitle: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
    },

    modelValue: {
      required: true,
      type: undefined,
    },

    activeProp: {
      type: Object,
      required: true,
    },

    moduleId: {
      type: String,
      required: false,
    },

    prop: {
      type: String,
      required: false,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      queued: 0,
      dirty: false,
      raf: null,

      modeStep: 0.01,
    };
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
        return this.modelValue;
      },

      set(value) {
        this.queued = value;
        this.dirty = true;
      },
    },
  },

  watch: {
    dirty(value) {
      if (value) {
        this.raf = requestAnimationFrame(this.queueLoop);
      }
    },
  },

  methods: {
    async queueLoop() {
      const { queued } = this;

      this.$emit("update:modelValue", queued);

      this.queued = null;
      this.dirty = false;
    },

    focusInput() {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: this.inputId,
        title: this.inputTitle,
      });
    },

    buttonDown() {
      this.internalValue = 1;
    },

    buttonUp() {
      this.internalValue = 0;
    },
  },
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
