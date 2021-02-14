<template>
  <div>
    <Sketch :value="color" @input="updateValue" ref="picker" />
  </div>
</template>

<script>
import { Sketch } from "vue-color";

export default {
  props: {
    value: {
      default: () => [],
      required: true
    }
  },

  components: {
    Sketch
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
  },

  methods: {
    updateValue(color) {
      this.color = color.rgba;
      this.$emit("input", this.rgbaToVec4(this.color).splice(3, 1));
    },

    rgbaToVec4({ r, g, b, a }) {
      return [r / 255, g / 255, b / 255, a];
    },

    vec4ToRgba([r, g, b, a]) {
      return { r: r * 255, g: g * 255, b: b * 255, a };
    }
  }
};
</script>
