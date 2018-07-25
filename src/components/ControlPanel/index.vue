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
  import colorControl from './ColorControl';
  import checkboxControl from './CheckboxControl';
  import imageControl from './ImageControl';
  import paletteControl from './PaletteControl';
  import rangeControl from './RangeControl';
  import selectControl from './SelectControl';
  import textControl from './TextControl';
  import twoDPointControl from './TwoDPointControl';

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
        const controls = [];
        const { module } = this;

        if (module) {
          Object.keys(module.props).forEach((key) => {
            const propData = module.props[key];
            propData.$modv_variable = key;
            propData.$modv_moduleName = module.meta.name;

            const type = propData.type;
            const control = propData.control;

            if (control) {
              controls.push({
                component: control.type,
                meta: propData,
              });
            }

            if (type === 'int' || type === 'float') {
              controls.push({
                component: 'rangeControl',
                meta: propData,
              });
            }

            if (type === 'bool') {
              controls.push({
                component: 'checkboxControl',
                meta: propData,
              });
            }

            if (type === 'string') {
              controls.push({
                component: 'textControl',
                meta: propData,
              });
            }

            if (type === 'vec2') {
              controls.push({
                component: 'twoDPointControl',
                meta: propData,
              });
            }

            if (type === 'enum') {
              controls.push({
                component: 'selectControl',
                meta: propData,
              });
            }
          });
        }

        return controls;
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
    },
  };
</script>

<style lang="scss">

</style>
