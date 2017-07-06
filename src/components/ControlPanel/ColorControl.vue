<template>
  <div class="color-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <sketch-picker :id='inputId' v-model='pickerColors' />
  </div>
</template>

<script>
  import { Sketch } from 'vue-color';

  const defaultProps = {
    hex: '#000000',
    hsl: {
      h: 150,
      s: 0.5,
      l: 0.2,
      a: 1
    },
    hsv: {
      h: 150,
      s: 0.66,
      v: 0.30,
      a: 1
    },
    rgba: {
      r: 25,
      g: 77,
      b: 51,
      a: 1
    },
    a: 1
  };

  export default {
    name: 'colorControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        value: undefined,
        pickerColors: defaultProps
      };
    },
    computed: {
      moduleName() {
        return this.module.info.name;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      pickerCacheVariable() {
        return `_colorPickerCache_${this.inputId}`;
      },
      label() {
        return this.control.label;
      },
      variable() {
        return this.control.variable;
      },
      defaultValue() {
        return this.control.default;
      },
      returnFormat() {
        return this.control.returnFormat;
      },
      rgbArray() {
        const rgba = this.pickerColors.rgba;
        return [rgba.r, rgba.g, rgba.b];
      },
      rgbString() {

      },
      rgbaArray() {
        const rgba = this.pickerColors.rgba;
        return [rgba.r, rgba.g, rgba.b, rgba.a];
      },
      rgbaString() {

      },
      hexString() {
        return this.pickerColors.hex;
      },
      hsvArray() {
        const hsv = this.pickerColors.hsv;
        return [hsv.r, hsv.g, hsv.b];
      },
      hsvString() {

      },
      hsvaArray() {
        const hsva = this.pickerColors.hsv;
        return [hsva.r, hsva.g, hsva.b, hsva.a];
      },
      hsvaString() {

      },
      hslArray() {
        const hsl = this.pickerColors.hsl;
        return [hsl.r, hsl.g, hsl.b];
      },
      hslString() {

      },
      hslaArray() {
        const hsla = this.pickerColors.hsl;
        return [hsla.r, hsla.g, hsla.b, hsla.a];
      },
      hslaString() {

      }
    },
    beforeMount() {
      this.value = this.module[this.variable];
      this.pickerColors = this.module[this.pickerCacheVariable] || defaultProps;

      if(typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
        this.pickerColors = this.module[this.pickerCacheVariable] || defaultProps;
      },
      value() {
        this.module[this.variable] = this.value;
      },
      pickerColors() {
        this.value = this[this.returnFormat || 'rgbaArray'];
        this.module[this.pickerCacheVariable] = this.pickerColors;
      }
    },
    components: {
      'sketch-picker': Sketch
    }
  };
</script>

<style scoped lang='scss'>
</style>