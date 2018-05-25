<template>
  <div
      class="column layer-item is-12"
      :class="{
        active: focusedLayerIndex === LayerIndex,
        locked: locked,
        collapsed: collapsed
      }"
      @click="focusLayer"
    >
    <div class="columns is-gapless is-multiline is-mobile">
      <div class="column is-12">
        <div class="control-bar handle columns is-gapless is-mobile" v-context-menu="menuOptions">
          <div class="column is-three-quarters">
            <div class="layer-title" @dblclick="startNameEdit" @keydown.enter="stopNameEdit">{{ name }}</div>
          </div>

          <div class="column is-one-quarter layer-item-controls">
            <div class="ibvf"></div>
            <div class="lock" @click="clickToggleLock">
              <i class="fa fa-unlock-alt"></i>
              <i class="fa fa-lock"></i>
            </div>

            <div class="collapse" @click="clickToggleCollapse">
              <i class="fa fa-toggle-down"></i>
              <i class="fa fa-toggle-up"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-12">
        <draggable
          class="module-list columns is-gapless is-mobile"
          v-model="modules"
          :options="{
            group: 'modules',
            handle: '.handle',
            chosenClass: 'chosen',
            animation: 100,
            disabled: locked,
          }"
          :data-layer-index="LayerIndex"
          @add="drop"
          @end="end"
        >
          <active-module
            v-for="module in modules"
            :moduleName="module"
            :key="module"
            :data-module-name="module"
            @dragstart.native="dragstart"
          ></active-module>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import ActiveModule from '@/components/ActiveModule';
  import draggable from 'vuedraggable';
  import { Menu, MenuItem } from 'nwjs-menu-browser';

  if (!window.nw) {
    window.nw = {
      Menu,
      MenuItem,
    };
  }

  const nw = window.nw;

  export default {
    name: 'layer',
    props: [
      'Layer',
      'LayerIndex',
    ],
    data() {
      return {
        menuOptions: {
          match: ['layerItem'],
          menuItems: [],
          createMenus: this.createMenus,
        },
        clearingChecked: false,
        inheritChecked: false,
        pipelineChecked: false,
        drawToOutputChecked: false,
      };
    },
    computed: {
      modules: {
        get() {
          return this.Layer.moduleOrder.map(moduleName => this.Layer.modules[moduleName]);
        },
        set(value) {
          this.updateModuleOrder({ layerIndex: this.LayerIndex, order: value });
        },
      },
      name() {
        if (!this.Layer) return '';
        if (!('name' in this.Layer)) return '';
        return this.Layer.name;
      },
      locked() {
        return this.Layer.locked;
      },
      collapsed() {
        return this.Layer.collapsed;
      },
      ...mapGetters('layers', {
        focusedLayerIndex: 'focusedLayerIndex',
        layers: 'allLayers',
      }),
    },
    methods: {
      ...mapActions('layers', [
        'addLayer',
        'toggleLocked',
        'toggleCollapsed',
        'addModuleToLayer',
        'updateModuleOrder',
        'moveModuleInstance',
      ]),
      ...mapActions('modVModules', [
        'createActiveModule',
      ]),
      ...mapMutations('layers', [
        'setLayerName',
        'setLayerFocus',
        'setClearing',
        'setInherit',
        'setInheritFrom',
        'setPipeline',
        'setDrawToOutput',
      ]),
      drop(e) {
        e.preventDefault();
        const moduleName = e.item.dataset.moduleName;

        if (e.item.childNodes[0].classList.contains('gallery-item')) {
          e.clone.parentNode.insertBefore(e.item, e.clone);
          e.clone.parentNode.removeChild(e.clone);

          this.createActiveModule({ moduleName }).then((module) => {
            this.addModuleToLayer({
              module,
              layerIndex: this.LayerIndex,
              position: e.newIndex,
            });
          });
        } else {
          const fromLayerIndex = parseInt(e.from.dataset.layerIndex, 10);
          const toLayerIndex = this.LayerIndex;

          this.moveModuleInstance({ fromLayerIndex, toLayerIndex, moduleName });
        }
      },
      end(e) {
        if (e.item) {
          e.item.classList.remove('deletable');
        }
      },
      startNameEdit() {
        const node = this.$el.querySelector('.layer-title');
        if (node.classList.contains('editable')) return;

        node.classList.add('editable');
        node.contentEditable = true;
        node.focus();
        node.addEventListener('blur', this.stopNameEdit);
      },
      stopNameEdit(e) {
        const node = this.$el.querySelector('.layer-title');
        node.removeEventListener('blur', this.stopNameEdit);
        e.preventDefault();

        if (!node.classList.contains('editable')) return;

        const inputText = node.textContent.trim();

        node.contentEditable = false;
        node.classList.remove('editable');

        if (inputText.length > 0) {
          this.setLayerName({
            LayerIndex: this.LayerIndex,
            name: inputText,
          });
        } else {
          node.textContent = this.Layer.name;
        }
      },
      focusLayer() {
        if (this.focusedLayerIndex === this.LayerIndex) return;
        this.setLayerFocus({
          LayerIndex: this.LayerIndex,
        });
      },
      dragover(e) {
        if (this.locked) e.dataTransfer.dropEffect = 'none';
      },
      dragstart(e) {
        const moduleName = e.target.dataset.moduleName;
        e.dataTransfer.setData('module-name', moduleName);
        e.dataTransfer.setData('layer-index', this.LayerIndex);
      },
      clickToggleLock() {
        this.toggleLocked({ layerIndex: this.LayerIndex });
      },
      clickToggleCollapse() {
        this.toggleCollapsed({ layerIndex: this.LayerIndex });
      },
      updateChecked() {
        const Layer = this.Layer;

        this.clearingChecked = Layer.clearing;
        this.inheritChecked = Layer.inherit;
        this.inheritanceIndex = Layer.inheritFrom;
        this.pipelineChecked = Layer.pipeline;
        this.drawToOutputChecked = Layer.drawToOutput;
      },
      createMenus() {
        const that = this;

        this.menuOptions.menuItems.splice(0, this.menuOptions.menuItems.length);

        // Create inheritance index options

        // <b-dropdown-item value="-1">Last Layer</b-dropdown-item>
        //     <b-dropdown-item
        //       v-for="layer, idx in layers"
        //       :key="idx"
        //       :value="idx"
        //     >{{ layer.name }}</b-dropdown-item>

        const inheritFromSubmenu = new nw.Menu({});

        const item = new nw.MenuItem({
          type: 'checkbox',
          label: 'Last Layer',
          checked: this.Layer.inheritFrom === -1,
          click: function click() {
            that.setInheritFrom({
              layerIndex: that.LayerIndex,
              inheritFrom: -1,
            });
          },
        });

        inheritFromSubmenu.append(item);

        this.layers.forEach((layer, idx) => {
          const item = new nw.MenuItem({
            type: 'checkbox',
            label: layer.name,
            checked: this.Layer.inheritFrom === idx,
            click: function click() {
              that.setInheritFrom({
                layerIndex: that.LayerIndex,
                inheritFrom: idx,
              });
            },
          });

          inheritFromSubmenu.append(item);
        });

        const inheritFromItem = new nw.MenuItem({
          label: 'Inherit From',
          submenu: inheritFromSubmenu,
          tooltip: 'The Layer to inherit frames from',
        });

        this.menuOptions.menuItems.push(
          new nw.MenuItem({
            label: this.name,
            enabled: false,
          }),
          new nw.MenuItem({
            type: 'separator',
          }),
          new nw.MenuItem({
            type: 'checkbox',
            label: 'Clearing',
            tooltip: 'Clear this Layer at the beginning of its draw cycle',
            checked: this.clearingChecked,
            click: function click() {
              that.setClearing({
                layerIndex: that.LayerIndex,
                clearing: this.checked,
              });
            },
          }),
          new nw.MenuItem({
            type: 'checkbox',
            label: 'Inherit',
            tooltip: 'Inherit frames from the \'Inherit From\' Layer',
            checked: this.inheritChecked,
            click: function click() {
              that.setInherit({
                layerIndex: that.LayerIndex,
                inherit: this.checked,
              });
            },
          }),

          inheritFromItem,

          new nw.MenuItem({
            type: 'checkbox',
            label: 'Pipeline',
            tooltip: `Modules pass frames directly to the next Module,
              bypassing drawing to the Layer until the end Module's draw cycle`
              .replace(/\s\s+/g, ' '),
            checked: this.pipelineChecked,
            click: function click() {
              that.setPipeline({
                layerIndex: that.LayerIndex,
                pipeline: this.checked,
              });
            },
          }),
          new nw.MenuItem({
            type: 'checkbox',
            label: 'Draw To Output',
            tooltip: 'Draw the Layer to the Output Window(s) at the end of the Layer\'s draw cycle',
            checked: this.drawToOutputChecked,
            click: function click() {
              that.setDrawToOutput({
                layerIndex: that.LayerIndex,
                drawToOutput: this.checked,
              });
            },
          }),
        );
      },
    },
    beforeMount() {
      this.updateChecked();
    },
    watch: {
      Layer: {
        handler() {
          this.updateChecked();
        },
        deep: true,
      },
    },
    components: {
      ActiveModule,
      draggable,
    },
  };
</script>

<style scoped lang="scss">
  .layer-item {
    width: calc(100% - 11px);
    min-height: 163px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    background-color: hsla(70,0%,22%,1);

    .module-list {
      display: block;
      min-height: 115px;
      position: relative;
      border-top: 1px solid rgba(255, 255, 255, 0.5);

      &:before {
        position: absolute;
        top: 36%;
        width: 100%;
        height: auto;
        text-align: center;
        font-size: 2em;
        color: rgb(49, 49, 49);
        text-shadow: 1px 1px rgba(138, 138, 138, 0.34), -1px -1px #0e0e0e;
        opacity: 0.7;
        pointer-events: none;
        content: 'Drag Modules Here';
        letter-spacing: normal;
      }
    }

    .control-bar {
      letter-spacing: 0px;
      padding: 2px 2px;
      height: 26px;
      position: relative;
      color: #fff;
    }

    .layer-title {
      display: inline-block;
      min-width: 100px;

      &.editable {
        cursor: text;
      }
    }

    &.active {
      background-color: hsla(39, 100%, 50%, 1);
      border-bottom: 1px solid rgba(0, 0, 0, 0.5);

      .control-bar {
        color: #000;
      }

      .module-list {
        border-top: 1px solid rgba(0, 0, 0, 0.5);

        &:before {
          color: orange;
          text-shadow: 1px 1px #ffe3a5, -1px -1px #ff8675;
        }
      }
    }

    .collapse,
    .lock {
      width: 18px;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
    }

    &.collapsed {
      min-height: 0;

      .module-list {
        height: 0;
        overflow: hidden;
        min-height: 0;
        padding: 0;
        border: none;
      }

      .fa-toggle-up {
        display: none;
      }

      .fa-toggle-down {
        display: block;
        margin: 1px 0 0 0;
      }

      .module-list {
        height: 0;
        overflow: hidden;
        min-height: 0;
        padding: 0;
        border: none;
      }
    }

    .fa-toggle-down {
      display: none;
    }

    .layer-item-controls {
      text-align: right;
      height: 100%;
    }

    .fa-toggle-down,
    .fa-lock {
      display: none;
    }

    &.locked {
      .fa-unlock-alt {
        display: none;
      }

      .fa-lock {
        display: block;
        margin: 1px 0 0 0;
      }
    }
  }
</style>
