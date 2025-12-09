<template>
  <div class="radio-group">
    <label
      v-for="option in options"
      :key="option.value"
      :class="[
        'radio-option',
        {
          active: isSelected(option.value),
          button: style === 'button',
          'radio-style': style === 'radio',
          disabled: disabled,
        },
      ]"
      @mousedown="!disabled && selectOption(option.value)"
    >
      <span
        v-if="style === 'radio'"
        :class="radioClassName(option.value)"
      ></span>
      <span v-else class="button-text">{{ option.label }}</span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      required: true,
      type: undefined,
    },

    options: {
      type: Array,
      required: true,
      // Each option should have: { value: any, label: string }
    },

    style: {
      type: String,
      default: "radio", // 'radio' or 'button'
      validator: (value) => ["radio", "button"].includes(value),
    },

    color: {
      type: String,
      default: "dark", // 'dark' or 'light'
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],

  computed: {
    classNames() {
      return {
        selected: "selected",
        unselected: "unselected",
      };
    },
  },

  methods: {
    isSelected(value) {
      return this.modelValue === value;
    },

    radioClassName(value) {
      return this.isSelected(value)
        ? this.classNames.selected
        : this.classNames.unselected;
    },

    selectOption(value) {
      this.$emit("update:modelValue", value);
    },
  },
};
</script>

<style>
@import "./Button.css";
</style>

<style scoped>
.radio-group {
  display: flex;
  gap: 4px;
}

.radio-option {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Radio Style */
.radio-style {
  width: 16px;
  height: 16px;
  background: #151515;
  position: relative;
  border-radius: 50%;
}

.radio-style.light {
  background: #363636;
}

.radio-style span.selected::before {
  content: "";
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.radio-style span.unselected::before {
  content: "";
  width: 8px;
  height: 8px;
  background: transparent;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Button Style */
.button-style {
  -webkit-appearance: none;
  background: #363636;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
  border-radius: 2px;
  min-width: 40px;
}

.button-style:hover {
  background: #484848;
}

.button-style.active {
  background: #666666;
}

.button-style:active {
  background: #9a9a9a;
}

.button-style.light {
  background: #484848;
}

.button-style.light:hover {
  background: #666666;
}

.button-style.light.active {
  background: #9a9a9a;
}

.button-style.disabled {
  background: #151515;
  color: #9a9a9a;
  cursor: not-allowed;
}

.button-style.disabled:hover {
  background: #151515;
}

.radio-style.disabled {
  background: #151515;
  cursor: not-allowed;
}

.radio-style.disabled span::before {
  background: #9a9a9a;
}

.button-text {
  font-size: 11px;
  color: #ffffff;
}
</style>
