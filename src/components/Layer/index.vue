<template>
  <div
      class="layer-item"
      :class="{
        active: focusedLayerIndex === LayerIndex,
        locked: locked,
        collapsed: collapsed
      }"
      @click='focusLayer'
    >
    <div class="control-bar handle pure-g">
      <div class="pure-u-3-5">
        <div class="title" @dblclick='startNameEdit' @keydown.enter='stopNameEdit'>{{ name }}</div>
      </div>

      <div class="pure-u-2-5 layer-item-controls">
        <div class="lock" @click='clickToggleLock'>
          <i class="fa fa-unlock-alt"></i>
          <i class="fa fa-lock"></i>
        </div>

        <div class="collapse" @click='clickToggleCollapse'>
          <i class="fa fa-toggle-down"></i>
          <i class="fa fa-toggle-up"></i>
        </div>
      </div>
    </div>
    <draggable
      class="module-list"
      v-model='modules'
      :options="{ group: 'modules' }"
      :data-layer-index='LayerIndex'
      @add='drop'
    >
      <active-module
        v-for='module in modules'
        :moduleName='module'
        :key='module'
        :data-module-name='module'
        @dragstart.native='dragstart'
      ></active-module>
    </draggable>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import ActiveModule from '@/components/ActiveModule';
  import draggable from 'vuedraggable';

  export default {
    name: 'layer',
    props: [
      'Layer',
      'LayerIndex'
    ],
    computed: {
      modules: {
        get() {
          return this.Layer.moduleOrder.map(moduleName => this.Layer.modules[moduleName]);
        },
        set(value) {
          this.updateModuleOrder({ layerIndex: this.LayerIndex, order: value });
        }
      },
      name() {
        if(!this.Layer) return '';
        if(!('name' in this.Layer)) return '';
        return this.Layer.name;
      },
      locked() {
        return this.Layer.locked;
      },
      collapsed() {
        return this.Layer.collapsed;
      },
      ...mapGetters('layers', [
        'focusedLayerIndex'
      ])
    },
    methods: {
      drop(e) {
        const moduleName = e.item.dataset.moduleName;

        if(e.item.classList.contains('gallery-item')) {
          e.item.parentNode.removeChild(e.item);
          this.createActiveModule({ moduleName }).then((module) => {
            this.addModuleToLayer({
              module,
              layerIndex: this.LayerIndex,
              position: e.newIndex
            });
          });
        } else {
          const fromLayerIndex = parseInt(e.from.dataset.layerIndex, 10);
          const toLayerIndex = this.LayerIndex;

          this.moveModuleInstance({ fromLayerIndex, toLayerIndex, moduleName });
        }
      },
      ...mapActions('layers', [
        'addLayer',
        'toggleLocked',
        'toggleCollapsed',
        'addModuleToLayer',
        'updateModuleOrder',
        'moveModuleInstance'
      ]),
      ...mapActions('modVModules', [
        'createActiveModule'
      ]),
      ...mapMutations('layers', [
        'setLayerName',
        'setLayerFocus'
      ]),
      startNameEdit() {
        const node = this.$el.querySelector('.title');
        if(node.classList.contains('editable')) return;

        node.classList.add('editable');
        node.contentEditable = true;
        node.focus();
        node.addEventListener('blur', this.stopNameEdit);
      },
      stopNameEdit(e) {
        const node = this.$el.querySelector('.title');
        node.removeEventListener('blur', this.stopNameEdit);
        e.preventDefault();

        if(!node.classList.contains('editable')) return;

        const inputText = node.textContent.trim();

        node.contentEditable = false;
        node.classList.remove('editable');

        if(inputText.length > 0) {
          this.setLayerName({
            LayerIndex: this.LayerIndex,
            name: inputText
          });
        } else {
          node.textContent = this.Layer.name;
        }
      },
      focusLayer() {
        if(this.focusedLayerIndex === this.LayerIndex) return;
        this.setLayerFocus({
          LayerIndex: this.LayerIndex
        });
      },
      dragover(e) {
        if(this.locked) e.dataTransfer.dropEffect = 'none';
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
      }
    },
    components: {
      ActiveModule,
      draggable
    }
  };
</script>

<style scoped>

</style>