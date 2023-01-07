<template>
  <div v-tooltip="{ visible: !editMode }">
    <div class="slot" v-show="!editMode" @click.right="toggleEditMode">
      <slot></slot>
    </div>

    <Number
      v-model="inputValue"
      type="number"
      :step="step"
      @keypress.enter="toggleEditMode"
      @click.right="toggleEditMode"
      @input="numberInputHandler"
      v-show="editMode"
      ref="input"
    />
  </div>
</template>

<script>
export default {
  props: {
    min: {
      type: Number,
      default: -1
    },
    max: {
      type: Number,
      default: 1
    },
    step: {
      type: Number,
      default: 0.001
    },
    default: Number,
    value: Number
  },

  data() {
    return {
      editMode: false,
      inputValue: 0
    };
  },

  created() {
    this.inputValue = this.value;
  },

  methods: {
    numberInputHandler() {
      this.$emit("input", this.inputValue);
    },

    toggleEditMode(e) {
      e.preventDefault();
      this.editMode = !this.editMode;

      if (this.editMode) {
        this.$refs.input.focus();
      }
    }
  },

  watch: {
    value(value) {
      if (value < this.min || value > this.max) {
        return false;
      }

      this.inputValue = value;
    }
  }
};
</script>

<style scoped>
.slot {
  display: flex;
  align-items: center;
}
</style>
