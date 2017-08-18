<template>
  <div class='pure-u-1-1 control-panel' v-if='focusedModule'>
    <div class='title'><h1>{{ name }}</h1></div>
    <div class='pure-form pure-form-aligned'>
      <component
        class='pure-control-group'
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
  import textControl from './TextControl';
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
      textControl,
      twoDPointControl
    }
  };
</script>

<style lang='scss'>
  .control-panel {
    box-sizing: border-box;
    box-shadow: 0px 0px 20px 5px rgba(0,0,0,0.35);
    background-color: #bdbdbd;
    color: #010101;
    border-radius: 4px;
    overflow: hidden;
    display: grid;
  }

  .control-panel .pure-form.pure-form-aligned {
    overflow-y: auto;
  }

  .control-panel .title {
    margin: 0;
    padding: 5px;
    background-color: #454545;
    color: #adadad;
  }

  .control-panel .title h1 {
    padding: 0;
    margin: 0;
    font-size: medium;
    font-weight: 400;
    letter-spacing: normal;
  }

  .control-panel label {
    font-size: 12px !important;
    letter-spacing: normal;
    text-align: left !important;
  }

  .control-panel .pure-control-group {
    border-bottom: 1px solid #aaa;
  }

  // .control-panel {
  //   height: 100%;
  // }

  .control-panel .pure-form-aligned .pure-control-group {
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