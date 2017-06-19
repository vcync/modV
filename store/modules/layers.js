import Vue from 'vue';
import { Layer } from '@/modv';
import store from '@/../store';

const state = {
  focusedLayer: 0,
  layers: []
};

// getters
const getters = {
  allLayers: state => state.layers,
  focusedLayerIndex: state => state.focusedLayer,
  focusedLayer: state => state.layers[state.focusedLayer]
};

// actions
const actions = {
  addLayer({ commit, state }) {
    const layerName = `Layer ${state.layers.length + 1}`;
    const layer = new Layer();
    layer.setName(layerName);

    const width = store.getters['size/width'];
    const height = store.getters['size/height'];
    let dpr = 1;
    if(store.getters['size/useRetina']) {
      dpr = window.devicePixelRatio;
    }

    layer.resize({ width, height, dpr });
    commit('addLayer', { layer });
    commit('setLayerFocus', {
      LayerIndex: state.layers.length - 1
    });
    return layer;
  },
  removeFocusedLayer({ commit, state }) {
    const Layer = state.layers[state.focusedLayer];
    Object.keys(Layer.modules).forEach((moduleName) => {
      commit(
        'modVModules/removeActiveModule',
        { moduleName },
        { root: true }
      );
    });
    commit('removeLayer', { layerIndex: state.focusedLayer });
    if(state.focusedLayer > 0) commit('setLayerFocus', { LayerIndex: state.focusedLayer - 1 });
  },
  toggleLocked({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if(Layer.locked) commit('unlock', { layerIndex });
    else commit('lock', { layerIndex });
  },
  toggleCollapsed({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if(Layer.collapsed) commit('uncollapse', { layerIndex });
    else commit('collapse', { layerIndex });
  },
  addModuleToLayer({ commit, state }, { module, layerIndex, position }) {
    if(typeof position !== 'number') {
      if(position < 0) {
        position = 0;
      }
    }
    commit('addModuleToLayer', { moduleName: module.info.name, layerIndex, position });
    commit(
      'modVModules/setModuleFocus',
      { activeModuleName: module.info.name },
      { root: true }
    );
  },
  updateModuleOrder({ commit, state }, { layerIndex, order }) {
    commit('updateModuleOrder', { layerIndex, order });
  },
  resize({ commit, state }, { width, height, dpr }) {
    state.layers.forEach((Layer) => {
      Layer.resize({ width, height, dpr });
    });
  },
  moveModuleInstance({ commit, state }, { fromLayerIndex, toLayerIndex, moduleName }) {
    const moduleInstance = state.layers[fromLayerIndex].modules[moduleName];

    commit('addModuleInstanceToLayer', { moduleName, moduleInstance, layerIndex: toLayerIndex });
    commit('removeModuleInstanceFromLayer', { moduleName, layerIndex: fromLayerIndex });
  }
};

// mutations
const mutations = {
  addModuleToLayer(state, { moduleName, layerIndex, position }) {
    const Layer = state.layers[layerIndex];
    if(Layer.locked) return;

    if (!Layer) {
      throw `Cannot find Layer with index ${layerIndex}`;
    } else {
      Layer.addModule(moduleName, position);
    }
  },
  removeModuleFromLayer(state, { moduleName, layerIndex }) {
    const Layer = state.layers[layerIndex];

    const moduleIndex = Layer.moduleOrder.indexOf(moduleName);
    if(moduleIndex < 0) return;

    Layer.moduleOrder.splice(moduleIndex, 1);
    Vue.delete(Layer.modules, moduleName);
  },
  addModuleInstanceToLayer(state, { moduleName, moduleInstance, layerIndex }) {
    Vue.set(state.layers[layerIndex].modules, moduleName, moduleInstance);
  },
  removeModuleInstanceFromLayer(state, { moduleName, layerIndex }) {
    const Layer = state.layers[layerIndex];
    Vue.delete(Layer.modules, moduleName);
  },
  addLayer(state, { layer }) {
    state.layers.push(layer);
  },
  removeLayer(state, { layerIndex }) {
    state.layers.splice(layerIndex, 1);
  },
  setLayerName(state, { LayerIndex, name }) {
    state.layers[LayerIndex].setName(name);
  },
  setLayerFocus(state, { LayerIndex }) {
    state.focusedLayer = LayerIndex;
  },
  lock(state, { layerIndex }) {
    state.layers[layerIndex].locked = true;
  },
  unlock(state, { layerIndex }) {
    state.layers[layerIndex].locked = false;
  },
  collapse(state, { layerIndex }) {
    state.layers[layerIndex].collapsed = true;
  },
  uncollapse(state, { layerIndex }) {
    state.layers[layerIndex].collapsed = false;
  },
  updateLayers(state, { layers }) {
    state.layers = layers;
  },
  updateModuleOrder(state, { layerIndex, order }) {
    const Layer = state.layers[layerIndex];
    Layer.moduleOrder = order;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};