<template>
  <li>
    <label :class="{ hidden: editable }" @dblclick="startEditable">{{
      nameInput
    }}</label>
    <input
      ref="editableInput"
      v-model="nameInput"
      :class="{ hidden: !editable }"
      type="text"
      @keypress.enter="endEditable"
      @blur="endEditable"
    />:
    <input v-model="contentsInput" class="monospace" type="text" />
  </li>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'ScopeItem',
  props: ['contents', 'name'],
  data() {
    return {
      editable: false,
      contentsInput: '',
      nameInput: ''
    }
  },
  computed: {},
  watch: {
    contentsInput() {
      this.$emit('updateContents', this.name, this.contentsInput)
    },
    contents() {
      this.$data.contentsInput = this.contents
    },
    name() {
      this.$data.nameInput = this.name
    }
  },
  beforeMount() {
    this.$data.contentsInput = this.contents
    this.$data.nameInput = this.name
  },
  methods: {
    startEditable() {
      this.$data.editable = true
      Vue.nextTick(() => {
        this.$refs.editableInput.focus()
      })
    },
    endEditable() {
      this.$data.editable = false
      this.$emit('updateName', this.name, this.nameInput)
    }
  }
}
</script>

<style lang="scss">
.monospace {
  font-family: monospace;
}
</style>
