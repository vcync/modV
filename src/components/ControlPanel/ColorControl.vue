<template>
  <div class="color-control" :data-moduleName="moduleName">
    <label :for="inputId">
      {{ label }}
    </label>
    <sketch-picker :id="inputId" :value="pickerColors" @input="updateValue" />
  </div>
</template>

<script>
  import { Sketch } from 'vue-color';
  import { mapActions } from 'vuex';

  export default {
    name: 'colorControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        value: undefined,
        pickerColors: {},
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
        if (!('rgba' in this.pickerColors)) return [0, 0, 0];

        const rgba = this.pickerColors.rgba;
        return [rgba.r, rgba.g, rgba.b];
      },
      rgbString() {

      },
      rgbaArray() {
        if (!('rgba' in this.pickerColors)) return [0, 0, 0, 0];

        const rgba = this.pickerColors.rgba;
        return [rgba.r, rgba.g, rgba.b, rgba.a];
      },
      mappedRgbaArray() {
        if (!('rgba' in this.pickerColors)) return [0, 0, 0, 0];

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
        if (!('hsv' in this.pickerColors)) return [0, 0, 0];

        const hsv = this.pickerColors.hsv;
        return [hsv.r, hsv.g, hsv.b];
      },
      hsvString() {

      },
      hsvaArray() {
        if (!('hsv' in this.pickerColors)) return [0, 0, 0, 0];

        const hsva = this.pickerColors.hsv;
        return [hsva.r, hsva.g, hsva.b, hsva.a];
      },
      hsvaString() {

      },
      hslArray() {
        if (!('hsl' in this.pickerColors)) return [0, 0, 0];

        const hsl = this.pickerColors.hsl;
        return [hsl.r, hsl.g, hsl.b];
      },
      hslString() {

      },
      hslaArray() {
        if (!('hsl' in this.pickerColors)) return [0, 0, 0, 0];

        const hsla = this.pickerColors.hsl;
        return [hsla.r, hsla.g, hsla.b, hsla.a];
      },
      hslaString() {

      },
    },
    methods: {
      ...mapActions('modVModules', [
        'setActiveModuleControlValue',
      ]),
      updateValue(value) {
        this.pickerColors = value;
      },
    },
    beforeMount() {
      if (this.module[this.pickerCacheVariable]) {
        this.pickerColors = this.module[this.pickerCacheVariable];
      } else {
        this.value = this.module[this.variable];

        if (typeof this.value === 'undefined') {
          this.value = this.defaultValue;
        }

        this.pickerColors = {
          r: Math.map(this.value[0], 0.0, 1.0, 0, 255),
          g: Math.map(this.value[1], 0.0, 1.0, 0, 255),
          b: Math.map(this.value[2], 0.0, 1.0, 0, 255),
          a: Math.map(this.value[3], 0, 1, 0, 1),
        };
      }
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
        this.pickerColors = this.module[this.pickerCacheVariable] || {};
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
