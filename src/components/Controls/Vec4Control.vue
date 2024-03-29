<template>
  <CollapsibleControl>
    <template v-slot:main>
      <c span="4">
        <div class="close-grids">
          <grid
            columns="4"
            :class="{ 'has-link': hasLinkX, focused: whichFocused === '0' }"
            @mousedown.stop="focusInput('0', 'x')"
          >
            <c span="1+1">X</c>
            <c span="3">
              <RangeControl
                :min="-1"
                :max="1"
                :strict="true"
                :value="x"
                :step="0.001"
                @input="emitValue('x', $event)"
              />
            </c>
          </grid>
          <grid
            columns="4"
            :class="{ 'has-link': hasLinkY, focused: whichFocused === '1' }"
            @mousedown.stop="focusInput('1', 'y')"
          >
            <c span="1+1">Y</c>
            <c span="3">
              <RangeControl
                :min="-1"
                :max="1"
                :strict="true"
                :value="y"
                :step="0.001"
                @input="emitValue('y', $event)"
              />
            </c>
          </grid>
          <grid
            columns="4"
            :class="{ 'has-link': hasLinkZ, focused: whichFocused === '2' }"
            @mousedown.stop="focusInput('2', 'z')"
          >
            <c span="1+1">Z</c>
            <c span="3">
              <RangeControl
                :min="-1"
                :max="1"
                :strict="true"
                :value="z"
                :step="0.001"
                @input="emitValue('z', $event)"
              />
            </c>
          </grid>
          <grid
            columns="4"
            :class="{ 'has-link': hasLinkW, focused: whichFocused === '3' }"
            @mousedown.stop="focusInput('3', 'w')"
          >
            <c span="1+1">W</c>
            <c span="3">
              <RangeControl
                :min="-1"
                :max="1"
                :strict="true"
                :value="w"
                :step="0.001"
                @input="emitValue('w', $event)"
              />
            </c>
          </grid>
        </div>
      </c>
    </template>

    <template v-slot:body>
      <grid columns="4">
        <c span="2+2"
          ><Sketch :value="color" @input="updateValue" ref="picker"
        /></c>
      </grid>
    </template>
  </CollapsibleControl>
</template>

<script>
import CollapsibleControl from "./CollapsibleControl";
import RangeControl from "./RangeControl";
import { Sketch } from "vue-color";

export default {
  props: {
    value: {
      type: Array,
      required: true
    },

    moduleId: {
      type: String,
      required: true
    },

    inputId: {
      type: String,
      required: true
    },

    inputTitle: {
      type: String,
      required: true
    },

    prop: {
      type: String,
      required: true
    }
  },

  components: {
    CollapsibleControl,
    RangeControl,
    Sketch
  },

  computed: {
    x() {
      return this.value[0];
    },

    y() {
      return this.value[1];
    },

    z() {
      return this.value[2];
    },

    w() {
      return this.value[3];
    },

    focusedInput() {
      return this.$modV.store.state.inputs.focusedInput.id;
    },

    whichFocused() {
      if (
        this.focusedInput &&
        this.focusedInput.indexOf(this.inputId) > -1 &&
        this.focusedInput.slice(-2, -1) === "-"
      ) {
        return this.focusedInput.slice(-1);
      }

      return "";
    },

    hasLinkX() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-0`];
    },

    hasLinkY() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-1`];
    },

    hasLinkZ() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-2`];
    },

    hasLinkW() {
      return this.$modV.store.state.inputs.inputLinks[`${this.inputId}-3`];
    }
  },

  methods: {
    focusInput(append, label) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: append ? `${this.inputId}-${append}` : this.inputId,
        title: append
          ? `${this.inputTitle}.${label ? label : append}`
          : this.inputTitle
      });
    },

    xyInput(e) {
      this.$emit("input", e);
    },

    emitValue(varName, e) {
      const { x, y, z, w } = this;
      const vars = { x, y, z, w };

      vars[varName] = e;

      const value = [vars.x, vars.y, vars.z, vars.w];

      this.$emit("input", value);
    },

    updateValue(color) {
      this.color = color.rgba;
      this.$emit("input", this.rgbaToVec4(this.color));
    },

    rgbaToVec4({ r, g, b, a }) {
      return [r / 255, g / 255, b / 255, a];
    },

    vec4ToRgba([r, g, b, a]) {
      return { r: r * 255, g: g * 255, b: b * 255, a };
    }
  },

  data() {
    return {
      color: { r: 0, g: 0, b: 0, a: 1 }
    };
  },

  created() {
    this.color = this.vec4ToRgba(this.value);
  },

  watch: {
    value(vec4) {
      this.color = this.vec4ToRgba(vec4);
    }
  }
};
</script>

<style scoped>
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
