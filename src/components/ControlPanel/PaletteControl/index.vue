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
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click='togglePicker'
        >{{ pickerButtonText }} picker</button>
      </div>
    </div>

    <div class="picker-wrapper">
      <sketch-picker v-model="pickerColors" :class="{'hidden': !showPicker}" />
    </div>

    <div class="pure-control-group">
      <label :for='`${inputId}-duration`'>Duration</label>
      <input
        :id='`${inputId}-duration`'
        type='range'
        v-model='durationInput'
        max='1000'
        min='2'
        :disabled='useBpmInput'
      >
      <input
        class="pure-form-message-inline"
        type='number'
        min='2'
        v-model='durationInput'
        step='any'
        :disabled='useBpmInput'
      >
    </div>
    <div class="pure-control-group">
      <label :for='`${inputId}-useBpm`'>Sync duration to BPM</label>
      <div class='customCheckbox'>
        <input
          :id='`${inputId}-useBpm`'
          type='checkbox'
          v-model='useBpmInput'
        >
        <label :for='`${inputId}-useBpm`'></label>
      </div>
    </div>
    <div class="pure-control-group" :class="{'hidden': !useBpmInput}">
      <label :for='`${inputId}-duration`'>BPM Division</label>
      <input
        :id='`${inputId}-duration`'
        type='range'
        v-model='bpmDivisonInput'
        max='32'
        min='1'
        step='1'
      >
      <input
        class="pure-form-message-inline"
        type='number'
        v-model='bpmDivisonInput'
        min='1'
        step='1'
      >
    </div>
    <div class="pure-control-group">
      <hr>
    </div>
    <div class="pure-control-group">
      <label :for='`${inputId}-load-palette`'>Profile</label>
      <profile-selector :id='`${inputId}-profile`' v-model='profileSelectorInput'></profile-selector>
    </div>
    <div class="pure-control-group">
      <label :for='`${inputId}-load-palette`'>Load Palette</label>
      <palette-selector
        :profile='profileSelectorInput'
        :id='`${inputId}-load-palette`'
        v-model='paletteSelectorInput'
      ></palette-selector>
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click='clickLoadPalette'
        >Load</button>
      </div>
    </div>
    <div class="pure-control-group">
      <label :for='`${inputId}-save-palette`'>Save Palette</label>
      <input :id='`${inputId}-save-palette`' v-model='savePaletteNameInput' type='text' />
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click='clickSavePalette'
        >Save</button>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import PaletteWorker from '@/modv/palette-worker/palette-worker';
  import { modV } from '@/modv';
  import { Sketch } from 'vue-color';

  import PaletteSelector from './PaletteSelector';
  import ProfileSelector from '../ProfileSelector';

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
        pickerColors: defaultProps,
        showPicker: false,
        useBpmInput: false,
        bpmDivisonInput: 16,
        profileSelectorInput: 'default',
        paletteSelectorInput: '',
        savePaletteNameInput: ''
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
      },
      pickerButtonText() {
        return this.showPicker ? 'Hide' : 'Show';
      }
    },
    methods: {
      ...mapActions('palettes', [
        'createPalette'
      ]),
      ...mapGetters('profiles', [
        'getPaletteFromProfile'
      ]),
      ...mapActions('profiles', [
        'savePaletteToProfile'
      ]),
      update(id, currentColor) {
        if(id === this.inputId) {
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
      },
      togglePicker() {
        this.showPicker = !this.showPicker;
      },
      clickLoadPalette() {
        const palette = this.getPaletteFromProfile()({
          paletteName: this.paletteSelectorInput,
          profileName: this.profileSelectorInput
        });

        this.$set(this.control, 'colors', palette);
        modV.workers.palette.setPalette(this.inputId, {
          colors: palette
        });
      },
      clickSavePalette() {
        this.savePaletteToProfile({
          profileName: this.profileSelectorInput,
          paletteName: this.savePaletteNameInput,
          colors: this.colors
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
      this.useBpmInput = this.control.useBpm;
      this.bpmDivisonInput = this.control.bpmDivison;
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
      },
      useBpmInput() {
        modV.workers.palette.setPalette(this.inputId, {
          useBpm: this.useBpmInput
        });
        this.control.useBpm = this.useBpmInput;
      },
      bpmDivisonInput() {
        modV.workers.palette.setPalette(this.inputId, {
          bpmDivison: this.bpmDivisonInput
        });
        this.control.bpmDivison = this.bpmDivisonInput;
      }
    },
    components: {
      'sketch-picker': Sketch,
      PaletteSelector,
      ProfileSelector
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
    cursor: pointer;
  }

  .swatch ~ .swatch {
    margin-left: -1px;
  }

  .swatch.current {
    border-color: #000;
    z-index: 1;
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

  .pure-control-group input {
    max-width: 129px;
  }

  input.pure-form-message-inline {
    max-width: 70px;
  }

  .picker-wrapper {
    text-align: right;

    .vue-color__sketch {
      display: inline-block;
      margin: 1em;
      text-align: left;
    }
  }

  .customCheckbox label {
    text-align: initial;
    display: initial;
    vertical-align: initial;
    width: 20px;
    margin: initial;
  }
</style>