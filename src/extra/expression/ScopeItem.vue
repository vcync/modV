<template>
  <li>
    <label :class='{ hidden: editable }' @dblclick='startEditable'>{{ nameInput }}</label>
    <input
      :class='{ hidden: !editable }'
      @keypress.enter='endEditable'
      @blur='endEditable'
      type='text'
      v-model='nameInput'
      ref='editableInput'
    >:
    <input class='monospace' type='text' v-model='contentsInput'>
  </li>
  </modal>
</template>

<script>
  import Vue from 'vue';

  export default {
    name: 'scope-item',
    props: [
      'contents',
      'name',
    ],
    data() {
      return {
        editable: false,
        contentsInput: '',
        nameInput: '',
      };
    },
    computed: {

    },
    methods: {
      startEditable() {
        this.$data.editable = true;
        Vue.nextTick(() => {
          this.$refs.editableInput.focus();
        });
      },
      endEditable() {
        this.$data.editable = false;
        this.$emit('updateName', this.name, this.nameInput);
      },
    },
    beforeMount() {
      this.$data.contentsInput = this.contents;
      this.$data.nameInput = this.name;
    },
    watch: {
      contentsInput() {
        this.$emit('updateContents', this.name, this.contentsInput);
      },
      contents() {
        this.$data.contentsInput = this.contents;
      },
      name() {
        this.$data.nameInput = this.name;
      },
    },
  };
</script>

<style lang='scss'>
  .monospace {
    font-family: monospace;
  }
</style>
