<template>
  <div
    class="active-item"
    :class="{current: focused}"
    tabindex="0"
    @focus="focusActiveModule"
    @keyup.delete="deletePress"
  >
    <div class="active-module-wrapper columns is-gapless is-mobile">
      <div class="column is-10">
        <div class="columns is-gapless is-mobile">
          <div class="column is-12">
            <span class="active-item-title">{{ moduleName }}</span>

            <div class="columns is-gapless is-mobile">
              <div class="column options">
                <b-field
                v-context-menu="checkboxMenuOptions"
                  horizontal
                  :for="enabledCheckboxId"
                  @click.native="checkboxClick"
                  label="Enabled"
                >
                  <b-checkbox
                    v-model="enabled"
                    :id="enabledCheckboxId"
                  />
                </b-field>
                <opacity-control :module-name="moduleName" v-context-menu="opacityMenuOptions" />
                <b-field
                  horizontal
                  label="Blending"
                >
                  <b-select class="dropdown" size="is-small" v-model="compositeOperation">
                    <option
                      :disabled="true"
                    >{{ blendModes.label }}</option>
                    <option
                      v-for="item in blendModes.children"
                      :key="item.value"
                      :value="item.value"
                    >{{ item.label }}</option>
                    <hr class="dropdown-divider">
                    <option
                      :disabled="true"
                    >{{ compositeOperations.label }}</option>
                    <option
                      v-for="item in compositeOperations.children"
                      :key="item.value"
                      :value="item.value"
                    >{{ item.label }}</option>
                  </b-select>
                </b-field>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-2 handle-container">
        <i class="active-module-handle handle fa fa-reorder fa-3x"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  import OpacityControl from './OpacityControl';

  export default {
    name: 'activeModule',
    components: {
      OpacityControl,
    },
    data() {
      return {
        compositeOperation: 'normal',
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
        return this.$store.state.modVModules.active[this.moduleName];
      },
      enabledCheckboxId() {
        return `${this.moduleName}:modvreserved:enabled`;
      },
      enabled: {
        get() {
          if (!this.moduleName) return false;
          return this.$store.state.modVModules.active[this.moduleName].meta.enabled;
        },
        set(value) {
          this.setActiveModuleEnabled({
            moduleName: this.moduleName,
            enabled: value,
          });
        },
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
        'setActiveModuleEnabled',
        'setActiveModuleCompositeOperation',
      ]),
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
      deletePress() {
        this.$store.dispatch('modVModules/removeActiveModule', { moduleName: this.moduleName });
      },
    },
    mounted() {
      if (!this.module) return;
      this.enabled = this.module.meta.enabled;
      this.opacity = this.module.meta.alpha;

      this.operations[0]
        .children.find(item => item.value === this.module.meta.compositeOperation).selected = true;
    },
    watch: {
      compositeOperation() {
        this.setActiveModuleCompositeOperation({
          moduleName: this.moduleName,
          compositeOperation: this.compositeOperation,
        });
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

<style lang="scss">
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

    .field {
      margin-bottom: 0;
    }

    .field-label {
      text-align: left;
      align-items: center;
      display: flex;
      justify-content: flex-end;
    }

    .field-body {
      flex-grow: 3;
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
      display: flex;
      justify-content: center;
      align-items: center;
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
