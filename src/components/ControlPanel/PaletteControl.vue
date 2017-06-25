<template>
  <div class="palette-control" :data-moduleName='moduleName'>
    <div class="pure-control-group">
      <label :for='inputId'>
        {{ label }}
      </label>
      <div class='palette'>
        <div
          class='swatch'
          v-for='(color, idx) in colors'
          :style="`background-color: rgb(${color[0]},${color[1]},${color[2]})`"
          :class="{ current: currentColor === idx }"
          @click='removeSwatch(idx)'
        ></div>
        <div
          class='add-swatch'
          @click='addSwatch'
        >
        </div>
      </div>
<!--       <div
        :style="`border-color: ${value}`"
        class="pure-form-message-inline"
      >{{ value }}</div> -->
    </div>
    <div class="pure-control-group">
      <label :for='`${inputId}-duration`'>Duration</label>
      <input
        :id='`${inputId}-duration`'
        type='range'
        v-model='durationInput'
        max='1000'
        min='2'
      >
      <div class="pure-form-message-inline">{{ durationInput }}</div>
    </div>
    <sketch-picker v-model="pickerColors" />
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import PaletteWorker from '@/modv/palette-worker/palette-worker';
  import { modV } from '@/modv';
  import { Sketch } from 'vue-color';

  const defaultProps = {
    hex: '#194d33',
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
    name: 'paletteControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        value: undefined,
        currentColor: 0,
        durationInput: undefined,
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
      label() {
        return this.control.label || 'Color Palette';
      },
      variable() {
        return this.control.variable;
      },
      varType() {
        return this.control.varType;
      },
      defaultValue() {
        return this.control.default;
      },
      colors() {
        return this.control.colors;
      },
      timePeriod() {
        return this.control.timePeriod;
      },
      pickerRgbArray() {
        const rgba = this.pickerColors.rgba;
        return [rgba.r, rgba.g, rgba.b];
      },
      pickerRgbString() {
        const rgba = this.pickerColors.rgba;
        return `rgb(${rgba.r},${rgba.g},${rgba.b})`;
      }
    },
    methods: {
      ...mapActions('palettes', [
        'createPalette'
      ]),
      update(id, currentColor, currentStep) {
        if(id === this.inputId) {
          this.value = currentStep;
          this.currentColor = currentColor;
        }
      },
      addSwatch() {
        this.control.colors.push(this.pickerRgbArray);
        modV.workers.palette.setPalette(this.inputId, {
          colors: this.control.colors
        });
      },
      removeSwatch(idx) {
        this.control.colors.splice(idx, 1);
        modV.workers.palette.setPalette(this.inputId, {
          colors: this.control.colors
        });
      }
    },
    created() {
      this.createPalette({ id: this.inputId, colors: this.colors, duration: this.timePeriod });
      modV.workers.palette.on(PaletteWorker.EventType.PALETTE_UPDATED, this.update.bind(this));
    },
    beforeMount() {
      this.value = this.module[this.variable];
      if(typeof this.value === 'undefined') this.value = this.defaultValue;

      this.durationInput = this.timePeriod;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
      },
      value() {
        this.module[this.variable] = this.value;
      },
      durationInput() {
        modV.workers.palette.setPalette(this.inputId, {
          timePeriod: this.durationInput
        });
        this.control.timePeriod = this.durationInput;
      }
    },
    components: {
      'sketch-picker': Sketch
    }
  };
</script>

<style scoped lang='scss'>
  /* Palette Control */
  .swatch, .add-swatch {
    display: inline-block;
    width: 10px !important;
    height: 10px;
    border: 1px #aaa solid;
    position: relative;
    text-align: left !important;
    vertical-align: middle !important;
    margin-right: 0 !important;
  }

  .swatch ~ .swatch {
    margin-left: -1px;
  }

  .swatch.current {
    border-color: #000;
    z-index: 1;
  }

  .add-swatch {
    cursor: pointer;
  }

  .add-swatch::before {
    content: '+';
    line-height: 8px;
    display: inline-block;
    vertical-align: top;
    font-size: 14px;
    text-align: center;
    width: 100%;
    height: 100%;
  }

  .add-swatch input {
    display: none;
  }

  .palette {
    display: inline-block;
    width: 129px;
  }

  .palette ~ .pure-form-message-inline {
    border: 1px solid;
    font-family: monospace;
  }
</style>