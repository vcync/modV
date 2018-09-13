<template>
  <div class="column control-panel is-6" :class="{ focused }">
    <article class="message">
      <div class="message-header">
        <p>{{ name }}</p>
        <button class="delete" :class="{ pinned }" @click="pin" :title="pinTitle">
          <b-icon icon="thumb-tack" size="is-small" />
        </button>
      </div>
      <div class="message-body" v-bar="{ useScrollbarPseudo: true }">
        <div class="pure-form pure-form-aligned">
          <module-preset-selector
            class="pure-control-group"
            :presets="module.presets || {}"
            :moduleName="name"
          />
          <component
            class="pure-control-group"
            v-for="control in controls"
            :is="control.component"
            :module="module"
            :meta="control.meta"
            :key="control.meta.$modv_variable"
          ></component>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';

  import generateControlData from './generate-control-data';

  import modulePresetSelector from './ModulePresetSelector';

  import colorControl from './ColorControl';
  import checkboxControl from './CheckboxControl';
  import imageControl from './ImageControl';
  import paletteControl from './PaletteControl';
  import rangeControl from './RangeControl';
  import selectControl from './SelectControl';
  import textControl from './TextControl';
  import twoDPointControl from './TwoDPointControl';
  import groupControl from './GroupControl';

  export default {
    name: 'controlPanel',
    props: {
      moduleName: String,
      pinned: { default: false },
      focused: { type: Boolean, default: false },
    },
    computed: {
      ...mapGetters('modVModules', [
        'getActiveModule',
      ]),
      module() {
        if (!this.moduleName) return false;
        return this.$store.getters['modVModules/outerActive'][this.moduleName];
      },
      name() {
        if (!this.module) return '';
        return this.module.meta.name;
      },
      controls() {
        return generateControlData({
          module: this.module,
        });
      },
      pinTitle() {
        return this.pinned ? 'Unpin' : 'Pin';
      },
    },
    methods: {
      ...mapMutations('controlPanels', [
        'pinPanel',
        'unpinPanel',
      ]),
      pin() {
        if (!this.pinned) {
          this.pinPanel({ moduleName: this.name });
        } else {
          this.unpinPanel({ moduleName: this.name });
        }
      },
    },
    components: {
      colorControl,
      checkboxControl,
      imageControl,
      paletteControl,
      rangeControl,
      selectControl,
      textControl,
      twoDPointControl,
      modulePresetSelector,
      groupControl,
    },
  };
</script>

<style lang="scss">

</style>
