<template>
  <CollapsibleControl>
    <template v-slot:main>
      <c span="3">
        <div class="color-well">
          <figure
            class="fake-color"
            @click.prevent="openColorPicker"
            :style="{ backgroundColor: cssBackground }"
          ></figure>
        </div>
      </c>
    </template>

    <template v-slot:body>
      <div class="close-grids">
        <grid
          columns="4"
          :class="{ 'has-link': hasLinkR, focused: whichFocused === 'r' }"
          @mousedown.stop="focusInput('r')"
        >
          <c span="1+1">R</c>
          <c span="3">
            <RangeControl
              :min="0"
              :max="1"
              :strict="true"
              :value="red"
              :step="0.001"
              @update:model-value="emitValue('red', $event)"
            />
          </c>
        </grid>
        <grid
          columns="4"
          :class="{ 'has-link': hasLinkG, focused: whichFocused === 'g' }"
          @mousedown.stop="focusInput('g')"
        >
          <c span="1+1">G</c>
          <c span="3">
            <RangeControl
              :min="0"
              :max="1"
              :strict="true"
              :value="green"
              :step="0.001"
              @update:model-value="emitValue('green', $event)"
            />
          </c>
        </grid>
        <grid
          columns="4"
          :class="{ 'has-link': hasLinkB, focused: whichFocused === 'b' }"
          @mousedown.stop="focusInput('b')"
        >
          <c span="1+1">B</c>
          <c span="3">
            <RangeControl
              :min="0"
              :max="1"
              :strict="true"
              :value="blue"
              :step="0.001"
              @update:model-value="emitValue('blue', $event)"
            />
          </c>
        </grid>
        <grid
          columns="4"
          :class="{ 'has-link': hasLinkA, focused: whichFocused === 'a' }"
          @mousedown.stop="focusInput('a')"
        >
          <c span="1+1">A</c>
          <c span="3">
            <RangeControl
              :min="0"
              :max="1"
              :strict="true"
              :value="alpha"
              :step="0.001"
              @update:model-value="emitValue('alpha', $event)"
            />
          </c>
        </grid>
      </div>
    </template>
  </CollapsibleControl>
</template>

<script>
import CollapsibleControl from "./CollapsibleControl.vue";
import RangeControl from "./RangeControl.vue";

const { ipcRenderer } = window.electron;

export default {
  emits: ["update:modelValue"],

  props: {
    modelValue: {
      type: String,
      required: true,
    },

    moduleId: {
      type: String,
      required: true,
    },

    inputId: {
      type: String,
      required: true,
    },

    inputTitle: {
      type: String,
      required: true,
    },

    prop: {
      type: String,
      required: true,
    },
  },

  components: {
    CollapsibleControl,
    RangeControl,
  },

  computed: {
    red() {
      return this.modelValue.r;
    },

    green() {
      return this.modelValue.g;
    },

    blue() {
      return this.modelValue.b;
    },

    alpha() {
      return this.modelValue.a;
    },

    cssBackground() {
      const { r, g, b, a } = this.modelValue;

      return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    },

    focusedInput() {
      return this.$modV.store.state.inputs.focusedInput.id;
    },

    whichFocused() {
      if (
        this.focusedInput.indexOf(this.inputId) > -1 &&
        this.focusedInput.slice(-2, -1) === "-"
      ) {
        return this.focusedInput.slice(-1);
      }

      return "";
    },

    hasLinkR() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-r`];
    },

    hasLinkG() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-g`];
    },

    hasLinkB() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-b`];
    },

    hasLinkA() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-a`];
    },
  },

  data() {
    return {
      pickerWindowId: null,
    };
  },

  methods: {
    openColorPicker() {
      ipcRenderer.send("open-window", "colorPicker");
      ipcRenderer.once("window-ready", (event, { window: windowName, id }) => {
        if (windowName !== "colorPicker") {
          return;
        }

        ipcRenderer.sendTo(id, "return-format", "rgba-ratio");

        ipcRenderer.sendTo(id, "module-info", {
          moduleId: this.moduleId,
          prop: this.prop,
          data: this.modelValue,
        });

        this.windowId = id;
      });
    },

    focusInput(append) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: append ? `${this.inputId}-${append}` : this.inputId,
        title: append ? `${this.inputTitle}.${append}` : this.inputTitle,
      });
    },

    emitValue(colorName, e) {
      const { red, green, blue, alpha } = this;
      const vars = { red, green, blue, alpha };

      vars[colorName] = e;

      const value = { r: vars.red, g: vars.green, b: vars.blue, a: vars.alpha };

      this.$emit("update:modelValue", value);
    },
  },

  watch: {
    value: {
      deep: true,
      handler() {
        if (this.windowId) {
          ipcRenderer.sendTo(this.windowId, "module-info", {
            moduleId: this.moduleId,
            prop: this.prop,
            data: this.value,
          });
        }
      },
    },
  },
};
</script>

<style scoped>
.fake-color {
  width: 44px;
  height: 23px;
  background-color: black;
  cursor: default;
  color: black;
  border-width: 5px;
  border-style: solid;
  border-color: rgb(239, 239, 239);
  border-image: initial;
  padding: 1px 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 0 1px rgb(118, 118, 118);
  position: relative;
}

.fake-color::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  background-size: contain;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP7//483HTx//hx/Ohg1gIFx6IcBALl+VXknOCvFAAAAAElFTkSuQmCC");
}

.fake-color::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: inherit;
}

.close-grids grid {
  margin-bottom: 0;
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
</style>
