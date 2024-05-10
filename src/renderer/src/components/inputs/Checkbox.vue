<template>
  <label @mousedown="mousedown">
    <span :class="spanClassName"></span>
  </label>
</template>

<script>
export default {
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      required: true,
    },

    allowPartial: {
      default: false,
    },

    emitBoolean: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      classNames: {
        0: "off",
        1: "on",
        2: "partial",
      },
    };
  },

  computed: {
    spanClassName() {
      let inferredValue = this.modelValue;

      // for backwards compatibility with the old Checkbox control which used true or false only
      if (this.modelValue === true || this.modelValue === false) {
        inferredValue = Number(inferredValue);
      }

      return this.classNames[inferredValue];
    },
  },

  methods: {
    mousedown(e) {
      const { altKey } = e;
      let { modelValue } = this;

      if (this.allowPartial && altKey) {
        modelValue = 2;
      } else if (modelValue || !modelValue) {
        modelValue = Number(!modelValue);
      } else if (modelValue === 2) {
        modelValue = 0;
      }

      if (this.emitBoolean) {
        this.$emit("update:modelValue", Boolean(modelValue));
      } else {
        this.$emit("update:modelValue", modelValue);
      }
    },
  },
};
</script>

<style scoped>
label {
  width: 16px;
  height: 16px;
  background: #151515;
  position: relative;
  display: block;
}

label.light {
  background: #363636;
}

span.on::before {
  content: "";
  width: 10px;
  height: 4px;
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 2px solid white;
  border-left: 2px solid white;
  transform: translateX(2px) translateY(3px) rotate(-45deg);
}

span.partial::before {
  content: "";
  width: 10px;
  height: 4px;
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 2px solid white;
  transform: translateX(3px) translateY(3px);
}
</style>
