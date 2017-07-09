<template>
  <div class="pure-u-1-1 control-panel">
    <div class="title"><h1>{{ name }}</h1></div>
    <div class="pure-form pure-form-aligned">
      <component
        class="pure-control-group"
        v-for='control in controls'
        :is='control.type'
        :module='focusedModule'
        :control='control'
        :key='control'
      ></component>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import colorControl from './ColorControl';
  import checkboxControl from './CheckboxControl';
  import imageControl from './ImageControl';
  import paletteControl from './PaletteControl';
  import rangeControl from './RangeControl';
  import selectControl from './SelectControl';
  import twoDPointControl from './TwoDPointControl';

  export default {
    name: 'controlPanel',
    computed: {
      ...mapGetters('modVModules', [
        'focusedModule'
      ]),
      name() {
        if(!this.focusedModule) return '';
        return this.focusedModule.info.name;
      },
      controls() {
        if(!this.focusedModule) return [];
        return this.focusedModule.info.controls;
      }
    },
    methods: {

    },
    components: {
      colorControl,
      checkboxControl,
      imageControl,
      paletteControl,
      rangeControl,
      selectControl,
      twoDPointControl
    }
  };
</script>

<style scoped lang='scss'>
  .control-panel {
    height: 100%;
  }

  .title {
    color: #000;
  }

  .pure-form-aligned .pure-control-group {
    margin: 0;
    padding: .5em 8px;

    &:nth-child(odd) {
      background-color: rgba(221, 221, 221, 0.32);
    }

    &:nth-child(even) {
      background-color: rgba(238, 238, 238, 0.22);
    }
  }
</style>