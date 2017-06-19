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
          <select class="composite-operations" style="color: black" v-model='compositeOperation'>
            <optgroup label="Blend Modes">
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="color-dodge">Color dodge</option>
              <option value="color-burn">Color burn</option>
              <option value="hard-light">Hard light</option>
              <option value="soft-light">Soft light</option>
              <option value="difference">Difference</option>
              <option value="exclusion">Exclusion</option>
              <option value="hue">Hue</option>
              <option value="saturation">Saturation</option>
              <option value="color">Color</option>
              <option value="luminosity">Luminosity</option>
            </optgroup>
            <optgroup label="Composite Modes">
              <option value="clear">Clear</option>
              <option value="copy">Copy</option>
              <option value="destination">Destination</option>
              <option value="source-over">Source over</option>
              <option value="destination-over">Destination over</option>
              <option value="source-in">Source in</option>
              <option value="destination-in">Destination in</option>
              <option value="source-out">Source out</option>
              <option value="destination-out">Destination out</option>
              <option value="source-atop">Source atop</option>
              <option value="destination-atop">Destination atop</option>
              <option value="xor">Xor</option>
              <option value="lighter">Lighter</option>
            </optgroup>
          </select>
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
        enabled: true,
        opacity: 1
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
      }
    },
    watch: {
      compositeOperation() {
        this.module.info.compositeOperation = this.compositeOperation;
      },
      enabled() {
        this.module.info.enabled = this.enabled;
      },
      opacity() {
        this.module.info.alpha = parseFloat(this.opacity);
      }
    }
  };
</script>

<style scoped>
  select.composite-operations {
    width: 60%;
  }
</style>