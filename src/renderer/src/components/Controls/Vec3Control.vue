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
                @update:model-value="emitValue('x', $event)"
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
                @update:model-value="emitValue('y', $event)"
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
                @update:model-value="emitValue('z', $event)"
              />
            </c>
          </grid>
        </div>
      </c>
    </template>

    <template v-slot:body>
      <grid columns="4">
        <c span="2+2"
          ><Vec2DXY :value="modelValue" @update:model-value="xyInput"
        /></c>
      </grid>
    </template>
  </CollapsibleControl>
</template>

<script>
import CollapsibleControl from "./CollapsibleControl.vue";
import RangeControl from "./RangeControl.vue";
import Vec2DXY from "./Vec2DXY.vue";

export default {
  props: {
    modelValue: {
      type: Array,
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
    Vec2DXY,
  },

  computed: {
    x() {
      return this.modelValue[0];
    },

    y() {
      return this.modelValue[1];
    },

    z() {
      return this.modelValue[2];
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
  },

  methods: {
    focusInput(append, label) {
      this.$modV.store.dispatch("inputs/setFocusedInput", {
        id: append ? `${this.inputId}-${append}` : this.inputId,
        title: append
          ? `${this.inputTitle}.${label ? label : append}`
          : this.inputTitle,
      });
    },

    xyInput(e) {
      this.$emit("update:modelValue", e);
    },

    emitValue(varName, e) {
      const { x, y, z } = this;
      const vars = { x, y, z };

      vars[varName] = e;

      const value = [vars.x, vars.y, vars.z];

      this.$emit("update:modelValue", value);
    },
  },

  watch: {
    modelValue: {
      deep: true,
      handler() {},
    },
  },
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
