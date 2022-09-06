<template>
  <label @mousedown="mousedown">
    <span :class="spanClassName"></span>
  </label>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    },

    allowPartial: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      classNames: {
        0: "off",
        1: "on",
        2: "partial"
      }
    };
  },

  computed: {
    spanClassName() {
      let inferredValue = this.value;

      // for backwards compatibility with the old Checkbox control which used true or false only
      if (this.value === true || this.value === false) {
        inferredValue = Number(inferredValue);
      }

      return this.classNames[inferredValue];
    }
  },

  methods: {
    mousedown(e) {
      const { altKey } = e;

      let value = this.value;

      if (this.allowPartial && altKey) {
        value = 2;
      } else if (value || !value) {
        value = Number(!value);
      } else if (value === 2) {
        value = 0;
      }

      this.$emit("input", value);
    }
  }
};
</script>

<style scoped>
input {
  width: 0;
  height: 0;
  -webkit-appearance: none;
}

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
