import { Layer } from '@/modv';
import store from '@/../store';

const state = {
  focusedLayer: 0,
  layers: []
};

// getters
const getters = {
  allLayers: state => state.layers,
  focusedLayer: state => state.focusedLayer
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
  addModuleToLayer({ commit, state }, { module, layerIndex }) {
    commit('addModuleToLayer', { moduleName: module.info.name, layerIndex });
    commit(
      'modVModules/setModuleFocus',
      { activeModuleName: module.info.name },
      { root: true }
    );
  },
  resize({ commit, state }, { width, height, dpr }) {
    state.layers.forEach((Layer) => {
      Layer.resize({ width, height, dpr });
    });
  }
};

// mutations
const mutations = {
  addModuleToLayer(state, { moduleName, layerIndex }) {
    const Layer = state.layers[layerIndex];
    if(Layer.locked) return;

    if (!Layer) {
      throw `Cannot find Layer with index ${layerIndex}`;
    } else {
      Layer.addModule(moduleName);
    }
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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};