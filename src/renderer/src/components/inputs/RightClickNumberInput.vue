<template>
  <div v-tooltip="{ visible: !editMode }">
    <div v-show="!editMode" class="slot" @click.right.stop="toggleEditMode">
      <slot></slot>
    </div>

    <Number
      v-show="editMode"
      ref="input"
      v-model="inputValue"
      type="number"
      :step="step"
      @keypress.enter="toggleEditMode"
      @click.right.stop="toggleEditMode"
      @update:model-value="numberInputHandler"
    />
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
    },
    min: {
      default: -1,
      type: Number,
    },
    max: {
      default: 1,
      type: Number,
    },
    step: {
      default: 0.001,
      type: Number,
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      editMode: false,
      inputValue: 0,
    };
  },

  watch: {
    modelValue(value) {
      if (value < this.min || value > this.max) {
        return false;
      }

      this.inputValue = value;
    },
  },

  created() {
    this.inputValue = this.modelValue;
  },

  methods: {
    numberInputHandler() {
      this.$emit("update:modelValue", this.inputValue);
    },

    toggleEditMode(e) {
      e.preventDefault();
      this.editMode = !this.editMode;

      if (this.editMode) {
        this.$refs.input.focus();
      }
    },
  },
};
</script>

<style scoped>
.slot {
  display: flex;
  align-items: center;
}
</style>
