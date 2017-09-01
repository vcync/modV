<template>
  <div class="pure-u-1-1 active-item" :class='{current: focused}' tabindex="0" @focus='focusActiveModule' @dragstart='dragstart'>
    <div class="pure-g">
      <!-- <canvas class="preview"></canvas> --><!-- TODO: create preview option on mouseover item -->
      <div class="pure-u-1-1 title">
        {{ moduleName }}
      </div>
      <div class="pure-u-4-5 options">
        <div class="control-group enable-group">
          <label :for='enabledCheckboxId'>Enabled</label>
          <div class="customCheckbox">
            <input type="checkbox" checked="true" class="enable" v-model='enabled' :id='enabledCheckboxId'>
            <label :for='enabledCheckboxId'></label>
          </div>

        </div>
        <div class="control-group opacity-group">
          <label for="">Opacity</label>
          <input type="range" min="0" max="1" value = "1" step="0.01" class="opacity" v-model='opacity'>
        </div>
        <div class="control-group blending-group">
          <label for="">Blending</label>
          <dropdown :data="operations" grouped placeholder='Normal' :width='150' :cbChanged="compositeOperationChanged"></dropdown>
        </div>
      </div>
      <div class="pure-u-1-5 handle-container">
        <span class="ibvf"></span>
        <i class="handle fa fa-reorder fa-3x"></i>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';

  export default {
    name: 'activeItem',
    data() {
      return {
        compositeOperation: 'normal',
        enabled: null,
        opacity: null,
        operations: [{
          label: 'Blend Modes',
          children: [{
            label: 'Normal',
            value: 'normal'
          }, {
            label: 'Multiply',
            value: 'multiply'
          }, {
            label: 'Overlay',
            value: 'overlay'
          }, {
            label: 'Darken',
            value: 'darken'
          }, {
            label: 'Lighten',
            value: 'lighten'
          }, {
            label: 'Color Dodge',
            value: 'color-dodge'
          }, {
            label: 'Color Burn',
            value: 'color-burn'
          }, {
            label: 'Hard Light',
            value: 'hard-light'
          }, {
            label: 'Soft Light',
            value: 'soft-light'
          }, {
            label: 'Difference',
            value: 'difference'
          }, {
            label: 'Exclusion',
            value: 'exclusion'
          }, {
            label: 'Hue',
            value: 'hue'
          }, {
            label: 'Saturation',
            value: 'saturation'
          }, {
            label: 'Color',
            value: 'color'
          }, {
            label: 'Luminosity',
            value: 'luminosity'
          }]
        },
        {
          label: 'Composite Modes',
          children: [{
            label: 'Clear',
            value: 'clear'
          }, {
            label: 'Copy',
            value: 'copy'
          }, {
            label: 'Destination',
            value: 'destination'
          }, {
            label: 'Source Over',
            value: 'source-over'
          }, {
            label: 'Destination Over',
            value: 'destination-over'
          }, {
            label: 'Source In',
            value: 'source-in'
          }, {
            label: 'Destination In',
            value: 'destination-in'
          }, {
            label: 'Source Out',
            value: 'source-out'
          }, {
            label: 'Destination Out',
            value: 'destination-out'
          }, {
            label: 'Source Atop',
            value: 'source-atop'
          }, {
            label: 'Destination Atop',
            value: 'destination-atop'
          }, {
            label: 'Xor',
            value: 'xor'
          }, {
            label: 'Lighter',
            value: 'lighter'
          }]
        }]
      };
    },
    props: [
      'moduleName'
    ],
    computed: {
      ...mapGetters('modVModules', [
        'focusedModuleName'
      ]),
      module() {
        return this.getActiveModule()(this.moduleName);
      },
      enabledCheckboxId() {
        return `${this.moduleName}:modvreserved:enabled`;
      },
      focused() {
        return this.moduleName === this.focusedModuleName;
      }
    },
    methods: {
      ...mapMutations('modVModules', [
        'setCurrentDragged',
        'setModuleFocus'
      ]),
      ...mapGetters('modVModules', [
        'getActiveModule'
      ]),
      inputOpacity(e) {
        console.log(e);
      },
      checkEnabled(e) {
        console.log(e);
      },
      changeBlendmode(e) {
        console.log(e);
      },
      focusActiveModule() {
        this.setModuleFocus({ activeModuleName: this.moduleName });
      },
      dragstart() {
        this.setCurrentDragged({ moduleName: this.moduleName });
      },
      compositeOperationChanged(item) {
        this.compositeOperation = item[0].value;
      }
    },
    mounted() {
      this.enabled = this.module.info.enabled;
      this.opacity = this.module.info.alpha;

      this.operations[0].children.find(item => item.value === this.module.info.compositeOperation).selected = true; //eslint-disable-line
    },
    watch: {
      compositeOperation() {
        this.module.info.compositeOperation = this.compositeOperation;
      },
      enabled() {
        console.log('enabled changed');
        this.module.info.enabled = this.enabled;
      },
      opacity() {
        this.module.info.alpha = parseFloat(this.opacity);
      }
    }
  };
</script>

<style scoped lang='scss'>
  .active-item {
    background-color: #222;
    border-bottom: 1px #333 solid;
    box-sizing: border-box;
    color: #fff;
    display: inline-block;
    max-height: 115px;
    padding: 8px;
    position: relative;
    transition: background 150ms;


    &:nth-child(even) {
      background-color: #000;
    }

    &.current {
      background-color: aliceblue;
      color: black;
      z-index: 100;
    }

    &.chosen {
      animation-direction: alternate;
      animation-duration: 700ms;
      animation-iteration-count: infinite;
      animation-name: chosen;
      animation-timing-function: linear;
    }

    &.chosen.deletable {
      animation-name: chosen-deletable;
    }

    @keyframes chosen {
      from {
        background-color: aliceblue;
      }

      to {
        background-color: lime;
      }
    }

    @keyframes chosen-deletable {
      from {
        background-color: aliceblue;
      }

      to {
        background-color: red;
      }
    }

    .title {
      font-size: 1.6em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .options label {
      font-size: 0.8em;
    }

    .handle-container {
      text-align: right;
    }

    .handle-container .handle {
      cursor: move;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
    }
  }
</style>