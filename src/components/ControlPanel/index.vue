<template>
  <div class="column control-panel" :class="{ focused }">
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
            :is="control.type"
            :module="module"
            :control="control"
            :key="control.variable"
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
        return this.getActiveModule(this.moduleName);
      },
      name() {
        if (!this.module) return '';
        return this.module.info.name;
      },
      controls() {
        if (!this.module) return [];
        return this.module.info.controls;
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
  .control-panel {
    label {
      font-size: 12px !important;
      letter-spacing: normal;
      text-align: left !important;
      display: inline-block;
      min-width: 70px;
      vertical-align: middle;
    }

    canvas {
      display: inline-block;
      vertical-align: middle;
    }

    div.control {
      display: inline-block;
      vertical-align: middle;
    }
  }

  .control-panel .pure-control-group {
    border-bottom: 1px solid #aaa;
  }

  .control-panel {
    height: 100%;
  }

  .pure-control-group {
    margin: 0;
    padding: .5em 8px;

    &:nth-child(odd) {
      background-color: rgba(221, 221, 221, 0.32);
    }

    &:nth-child(even) {
      background-color: rgba(238, 238, 238, 0.22);
    }
  }

  .control-panel .message button.delete {
    &:before {
      content: unset;
    }

    &:after {
      content: unset;
    }

    padding: 0 0.15em;
    color: #fff;
    font-size: 0.8em;

    transform: rotateZ(45deg);
    transition: transform 300ms;
    will-change: transform;

    &.pinned {
      transform: rotateZ(0deg) scale(1.2);
    }
  }

  .control-panel.focused {
    .message-header {
      background-color: aliceblue;
      color: black;
    }
  }

  .message {
    background-color: #bdbdbd;
    height: 100%;
    overflow: hidden;

    .message-body {
      height: 100%;
    }
  }

  .control-panel:not(:last-child) {
    margin-right: 10px !important;
  }
</style>
