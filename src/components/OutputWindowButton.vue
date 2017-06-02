<template>
  <div class="canvas-preview-output" @click='createWindow'>
    <i class="fa fa-external-link"></i>
    <span class="canvas-preview-output-text">Output Window</span>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'outputWindowButton',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
      };
    },
    methods: {
      ...mapActions('windows', [
        'createWindow'
      ])
    }
  };
</script>

<style scoped lang='scss'>

</style>