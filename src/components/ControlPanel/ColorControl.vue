<template>
  <div class="color-control" :data-moduleName="moduleName">
    <label :for="inputId">
      {{ label }}
    </label>
    <sketch-picker :id="inputId" v-model="pickerColors" />
  </div>
</template>

<script>
  import { Sketch } from 'vue-color';
  import { mapMutations } from 'vuex';

  const defaultProps = {
    hex: '#000000',
    hsl: {
      h: 150,
      s: 0.5,
      l: 0.2,
      a: 1,
    },
    hsv: {
      h: 150,
      s: 0.66,
      v: 0.30,
      a: 1,
    },
    rgba: {
      r: 25,
      g: 77,
      b: 51,
      a: 1,
    },
    a: 1,
  };

  export default {
    name: 'colorControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        value: undefined,
        pickerColors: defaultProps,
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
      mappedRgbaArray() {
        const rgba = this.pickerColors.rgba;
        const red = Math.map(rgba.r, 0, 255, 0.0, 1.0);
        const green = Math.map(rgba.g, 0, 255, 0.0, 1.0);
        const blue = Math.map(rgba.b, 0, 255, 0.0, 1.0);
        const alpha = Math.map(rgba.a, 0, 1, 0.0, 1.0);

        return [red, green, blue, alpha];
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

      },
    },
    methods: {
      ...mapMutations('modVModules', [
        'setActiveModuleControlValue',
      ]),
    },
    beforeMount() {
      this.value = this.module[this.variable];
      this.pickerColors = this.module[this.pickerCacheVariable] || defaultProps;

      if (typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
        this.pickerColors = this.module[this.pickerCacheVariable] || defaultProps;
      },
      value(value) {
        // this.module[this.variable] = value;
        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value,
        });
      },
      pickerColors(value) {
        this.value = this[this.returnFormat || 'rgbaArray'];
        this.module[this.pickerCacheVariable] = value;
      },
    },
    components: {
      'sketch-picker': Sketch,
    },
  };
</script>

<style scoped lang='scss'>
</style>
