<template>
  <div class="palette-control" :data-moduleName="moduleName">
    <div class="pure-control-group">
      <label :for="inputId">
        {{ label }}
      </label>
      <draggable
        :options="dragOptions"
        v-model="colors"
        class="palette"
      >
        <div
          class="swatch"
          v-for="(color, idx) in colors"
          :style="{
            backgroundColor: `rgb(${color.r},${color.g},${color.b})`,
            transitionDuration: `${duration / colors.length}ms`,
          }"
          :class="{ current: currentColor === idx || toColor === idx }"
          @click="removeSwatch(idx)"
        ></div>
      </draggable>
      <div class="add-swatch" @click="addSwatch"></div>
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click="togglePicker"
        >{{ pickerButtonText }} picker</button>
      </div>
    </div>

    <div class="picker-wrapper">
      <sketch-picker v-model="pickerColors" v-show="showPicker" />
    </div>

    <div class="pure-control-group">
      <label :for="`${inputId}-duration`">Duration</label>
      <input
        :id="`${inputId}-duration`"
        type="range"
        v-model="durationInput"
        max="1000"
        min="2"
        :disabled="useBpmInput"
      >
      <input
        class="pure-form-message-inline"
        type="number"
        min="2"
        v-model="durationInput"
        step="any"
        :disabled="useBpmInput"
      >
    </div>
    <div class="pure-control-group">
      <label :for="`${inputId}-useBpm`">Sync duration to BPM</label>
      <b-checkbox :id="`${inputId}-useBpm`" v-model="useBpmInput"></b-checkbox>
    </div>
    <div class="pure-control-group" v-show="useBpmInput">
      <label :for="`${inputId}-bpmDivision`">BPM Division</label>
      <input
        :id="`${inputId}-bpmDivision`"
        type="range"
        v-model="bpmDivisionInput"
        max="32"
        min="1"
        step="1"
      >
      <input
        class="pure-form-message-inline"
        type="number"
        v-model="bpmDivisionInput"
        min="1"
        step="1"
      >
    </div>
    <div class="pure-control-group">
      <label :for="`${inputId}-load-palette`">Project</label>
      <project-selector
        :id="`${inputId}-project`"
        v-model="projectSelectorInput"
      ></project-selector>
    </div>
    <div class="pure-control-group">
      <label :for="`${inputId}-load-palette`">Load Palette</label>
      <palette-selector
        :project="projectSelectorInput"
        :id="`${inputId}-load-palette`"
        v-model="paletteSelectorInput"
      ></palette-selector>
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click="clickLoadPalette"
        >Load</button>
      </div>
    </div>
    <div class="pure-control-group">
      <label :for="`${inputId}-save-palette`">Save Palette</label>
      <input :id="`${inputId}-save-palette`" v-model="savePaletteNameInput" type="text" />
      <div class="pure-form-message-inline">
        <button
          class="pure-button"
          @click="clickSavePalette"
        >Save</button>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import draggable from 'vuedraggable';
  import { Sketch } from 'vue-color';

  import PaletteSelector from './PaletteSelector';
  import ProjectSelector from '../ProjectSelector';

  const defaultProps = {
    hex: '#194d33',
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
    name: 'paletteControl',
    data() {
      return {
        dragOptions: {
          group: {
            name: 'palette',
            pull: true,
            put: true,
          },
        },
        durationInput: undefined,
        pickerColors: defaultProps,
        showPicker: false,
        useBpmInput: false,
        bpmDivisionInput: 16,
        projectSelectorInput: 'default',
        paletteSelectorInput: '',
        savePaletteNameInput: '',
      };
    },
    computed: {
      options() {
        return this.meta.control.options;
      },
      defaultValue() {
        return this.options.colors;
      },
      ...mapGetters('palettes', [
        'allPalettes',
      ]),
      palette() {
        return this.$store.state.palettes.palettes[`${this.moduleName}-${this.variable}`];
      },
      colors: {
        get() {
          return this.palette.colors;
        },
        set(value) {
          this.updateColors({
            id: this.inputId,
            colors: value,
          });
        },
      },
      duration() {
        return this.palette.duration;
      },
      useBpm() {
        return this.palette.useBpm;
      },
      bpmDivision() {
        return this.palette.bpmDivision;
      },
      pickerButtonText() {
        return this.showPicker ? 'Hide' : 'Show';
      },
      currentColor() {
        return this.palette.currentColor;
      },
      toColor() {
        const nextColor = this.palette.currentColor + 1;
        if (nextColor > this.colors.length - 1) return 0;
        return nextColor;
      },
    },
    methods: {
      ...mapActions('palettes', [
        'createPalette',
        'updateColors',
        'updateDuration',
        'updateUseBpm',
        'updateBpmDivision',
      ]),
      ...mapGetters('projects', [
        'getPaletteFromProject',
      ]),
      ...mapActions('projects', [
        'savePaletteToProject',
      ]),
      addSwatch() {
        const updatedColors = this.colors.slice();
        updatedColors.push(this.pickerColors.rgba);

        this.updateColors({
          id: this.inputId,
          colors: updatedColors,
        });
      },
      removeSwatch(idx) {
        const updatedColors = this.colors.slice();
        updatedColors.splice(idx, 1);

        this.updateColors({
          id: this.inputId,
          colors: updatedColors,
        });
      },
      togglePicker() {
        this.showPicker = !this.showPicker;
      },
      clickLoadPalette() {
        let palette = this.getPaletteFromProject()({
          paletteName: this.paletteSelectorInput,
          projectName: this.projectSelectorInput,
        });

        if (Array.isArray(palette)) {
          palette = palette.map(c => ({ r: c[0], g: c[1], b: c[2] }));
        }

        this.updateColors({
          id: this.inputId,
          colors: palette,
        });
      },
      clickSavePalette() {
        this.savePaletteToProject({
          projectName: this.projectSelectorInput,
          paletteName: this.savePaletteNameInput,
          colors: this.colors,
        });
      },
    },
    beforeMount() {
      if (typeof this.value === 'undefined') this.value = this.options.colors;

      this.durationInput = this.duration;
      this.useBpmInput = this.useBpm;
      this.bpmDivisionInput = this.bpmDivision;
    },
    watch: {
      durationInput() {
        this.updateDuration({
          id: this.inputId,
          duration: this.durationInput,
        });
      },
      useBpmInput() {
        this.updateUseBpm({
          id: this.inputId,
          useBpm: this.useBpmInput,
        });
      },
      bpmDivisionInput() {
        this.updateBpmDivision({
          id: this.inputId,
          bpmDivision: this.bpmDivisionInput,
        });
      },
    },
    components: {
      'sketch-picker': Sketch,
      PaletteSelector,
      ProjectSelector,
      draggable,
    },
  };
</script>

<style scoped lang="scss">
  /* Palette Control */
  .swatch, .add-swatch {
    border-radius: 50%;
    display: inline-block;
    height: 12px;
    width: 12px;
    margin: 3px;
    cursor: pointer;
    border: 2px solid #fff;

    transition: border-color 1200ms;
  }

  // .swatch ~ .swatch {
  //   margin-left: -1px;
  // }

  .swatch.current {
    border-color: #000;
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
    // width: 129px;
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
