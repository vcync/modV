<template>
  <div class="column active-item" :class="{current: focused}" tabindex="0" @focus="focusActiveModule" @dragstart="dragstart">
    <div class="columns is-gapless is-mobile">
      <!-- <canvas class="preview"></canvas> --><!-- TODO: create preview option on mouseover item -->
      <div class="column is-12">
        <div class="active-module-wrapper">
          <div class="columns is-gapless is-mobile">
            <div class="column is-10">
              <div class="columns is-gapless is-mobile">
                <div class="column is-12">
                  <span class="active-item-title">{{ moduleName }}</span>

                  <div class="columns is-gapless is-mobile">
                    <div class="column options">
                      <div class="control-group enable-group" v-context-menu="checkboxMenuOptions">
                        <label
                          :for="enabledCheckboxId"
                          @click="checkboxClick"
                        >Enabled</label>
                        <b-checkbox
                          v-model="enabled"
                          :id="enabledCheckboxId"
                        ></b-checkbox>
                      </div>
                      <div class="control-group opacity-group" v-context-menu="opacityMenuOptions">
                        <label for="">Opacity</label>
                        <input type="range" min="0" max="1" value = "1" step="any" class="opacity" v-model="opacity">
                      </div>
                      <div class="control-group blending-group">
                        <label for="">Blending</label>
                        <!-- <dropdown :data="operations" grouped placeholder="Normal" :width="150" :cbChanged="compositeOperationChanged"></dropdown> -->
                        <b-dropdown class="dropdown" v-model="compositeOperation">
                          <button class="button is-primary is-small" slot="trigger">
                            <span>{{ compositeOperation | capitalize }}</span>
                            <b-icon icon="angle-down"></b-icon>
                          </button>

                          <b-dropdown-item
                            :disabled="true"
                          >{{ blendModes.label }}</b-dropdown-item>
                          <b-dropdown-item
                            v-for="item in blendModes.children"
                            :key="item.value"
                            :value="item.value"
                          >{{ item.label }}</b-dropdown-item>
                          <hr class="dropdown-divider">
                          <b-dropdown-item
                            :disabled="true"
                          >{{ compositeOperations.label }}</b-dropdown-item>
                          <b-dropdown-item
                            v-for="item in compositeOperations.children"
                            :key="item.value"
                            :value="item.value"
                          >{{ item.label }}</b-dropdown-item>
                        </b-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-2 handle-container">
              <span class="ibvf"></span>
              <i class="handle fa fa-reorder fa-3x"></i>
            </div>
          </div>
        </div>
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
        checkboxMenuOptions: {
          match: ['@modv/module:internal'],
          menuItems: [],
          internalVariable: 'enable',
        },
        opacityMenuOptions: {
          match: ['@modv/module:internal'],
          menuItems: [],
          internalVariable: 'alpha',
        },
        operations: [{
          label: 'Blend Modes',
          children: [{
            label: 'Normal',
            value: 'normal',
          }, {
            label: 'Multiply',
            value: 'multiply',
          }, {
            label: 'Overlay',
            value: 'overlay',
          }, {
            label: 'Darken',
            value: 'darken',
          }, {
            label: 'Lighten',
            value: 'lighten',
          }, {
            label: 'Color Dodge',
            value: 'color-dodge',
          }, {
            label: 'Color Burn',
            value: 'color-burn',
          }, {
            label: 'Hard Light',
            value: 'hard-light',
          }, {
            label: 'Soft Light',
            value: 'soft-light',
          }, {
            label: 'Difference',
            value: 'difference',
          }, {
            label: 'Exclusion',
            value: 'exclusion',
          }, {
            label: 'Hue',
            value: 'hue',
          }, {
            label: 'Saturation',
            value: 'saturation',
          }, {
            label: 'Color',
            value: 'color',
          }, {
            label: 'Luminosity',
            value: 'luminosity',
          }],
        },
        {
          label: 'Composite Modes',
          children: [{
            label: 'Clear',
            value: 'clear',
          }, {
            label: 'Copy',
            value: 'copy',
          }, {
            label: 'Destination',
            value: 'destination',
          }, {
            label: 'Source Over',
            value: 'source-over',
          }, {
            label: 'Destination Over',
            value: 'destination-over',
          }, {
            label: 'Source In',
            value: 'source-in',
          }, {
            label: 'Destination In',
            value: 'destination-in',
          }, {
            label: 'Source Out',
            value: 'source-out',
          }, {
            label: 'Destination Out',
            value: 'destination-out',
          }, {
            label: 'Source Atop',
            value: 'source-atop',
          }, {
            label: 'Destination Atop',
            value: 'destination-atop',
          }, {
            label: 'Xor',
            value: 'xor',
          }, {
            label: 'Lighter',
            value: 'lighter',
          }],
        }],
      };
    },
    props: [
      'moduleName',
    ],
    computed: {
      ...mapGetters('modVModules', [
        'activeModules',
        'focusedModuleName',
      ]),
      module() {
        return this.getActiveModule()(this.moduleName);
      },
      enabledCheckboxId() {
        return `${this.moduleName}:modvreserved:enabled`;
      },
      focused() {
        return this.moduleName === this.focusedModuleName;
      },
      blendModes() {
        return this.operations[0];
      },
      compositeOperations() {
        return this.operations[1];
      },
    },
    methods: {
      ...mapMutations('modVModules', [
        'setCurrentDragged',
        'setModuleFocus',
        'setActiveModuleAlpha',
        'setActiveModuleEnabled',
        'setActiveModuleCompositeOperation',
      ]),
      ...mapGetters('modVModules', [
        'getActiveModule',
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
      },
      checkboxClick() {
        this.enabled = !this.enabled;
      },
    },
    mounted() {
      this.enabled = this.module.info.enabled;
      this.opacity = this.module.info.alpha;

      this.operations[0]
        .children.find(item => item.value === this.module.info.compositeOperation).selected = true;
    },
    watch: {
      compositeOperation() {
        this.setActiveModuleCompositeOperation({
          moduleName: this.moduleName,
          compositeOperation: this.compositeOperation,
        });
      },
      enabled() {
        this.setActiveModuleEnabled({ moduleName: this.moduleName, enabled: this.enabled });
      },
      opacity() {
        this.setActiveModuleAlpha({ moduleName: this.moduleName, alpha: parseFloat(this.opacity) });
      },
      activeModules: {
        handler(value) {
          this.enabled = value[this.moduleName].info.enabled;
          this.opacity = value[this.moduleName].info.alpha;
        },
        deep: true,
      },
    },
    filters: {
      capitalize(valueIn) {
        let value = valueIn;
        if (!value) return '';
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
  };
</script>

<style lang='scss'>
  .active-item {
    background-color: #222;
    border-bottom: 1px #333 solid;
    box-sizing: border-box;
    color: #fff;
    display: inline-block;
    position: relative;
    transition: background 150ms;
    width: 100%;

    &:nth-child(even) {
      background-color: #000;
    }

    &.current {
      background-color: aliceblue;
      color: black;
      // z-index: 1;
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

    input[type='range'] {
      vertical-align: middle;
    }

    .active-item-title {
      font-size: 1.6em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
      display: block;
      margin: 0;
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

    .active-module-wrapper {
      padding: 8px;
      box-sizing: border-box;
      height: 135px;
    }

    @media screen and (min-width: 1023px) {
      .dropdown .dropdown-content {
        height: 220px;
        overflow-y: scroll;
        overflow-x: hidden;
      }
    }
  }
</style>
