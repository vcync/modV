import Vue from 'vue';
import { Layer } from '@/modv';
import store from '@/../store';

const state = {
  focusedLayer: 0,
  layers: [],
};

// getters
const getters = {
  allLayers: state => state.layers,
  focusedLayerIndex: state => state.focusedLayer,
  focusedLayer: state => state.layers[state.focusedLayer],
};

// actions
const actions = {
  addLayer({ commit, state }) {
    return new Promise((resolve) => {
      const layerName = `Layer ${state.layers.length + 1}`;
      const layer = new Layer();
      layer.setName(layerName);

      const width = store.getters['size/width'];
      const height = store.getters['size/height'];
      let dpr = 1;
      if (store.getters['user/useRetina']) {
        dpr = window.devicePixelRatio;
      }

      layer.resize({ width, height, dpr });
      commit('addLayer', { layer });
      commit('setLayerFocus', {
        LayerIndex: state.layers.length - 1,
      });

      resolve({
        Layer: layer,
        index: state.layers.length - 1,
      });
    });
  },
  removeFocusedLayer({ commit, state }) {
    const Layer = state.layers[state.focusedLayer];
    Object.keys(Layer.modules).forEach((moduleName) => {
      store.dispatch(
        'modVModules/removeActiveModule',
        { moduleName },
      );
    });
    commit('removeLayer', { layerIndex: state.focusedLayer });
    if (state.focusedLayer > 0) commit('setLayerFocus', { LayerIndex: state.focusedLayer - 1 });
  },
  toggleLocked({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if (Layer.locked) commit('unlock', { layerIndex });
    else commit('lock', { layerIndex });
  },
  toggleCollapsed({ commit, state }, { layerIndex }) {
    const Layer = state.layers[layerIndex];

    if (Layer.collapsed) commit('uncollapse', { layerIndex });
    else commit('collapse', { layerIndex });
  },
  addModuleToLayer({ commit }, { module, layerIndex, position }) {
    let positionShadow = position;
    if (typeof positionShadow !== 'number') {
      if (positionShadow < 0) {
        positionShadow = 0;
      }
    }
    commit('addModuleToLayer', { moduleName: module.info.name, layerIndex, position: positionShadow });
    store.commit(
      'modVModules/setModuleFocus',
      { activeModuleName: module.info.name },
      { root: true },
    );
  },
  updateModuleOrder({ commit }, { layerIndex, order }) {
    commit('updateModuleOrder', { layerIndex, order });
  },
  resize({ state }, { width, height, dpr }) {
    state.layers.forEach((Layer) => {
      Layer.resize({ width, height, dpr });
    });
  },
  moveModuleInstance({ commit, state }, { fromLayerIndex, toLayerIndex, moduleName }) {
    const moduleInstance = state.layers[fromLayerIndex].modules[moduleName];

    commit('addModuleInstanceToLayer', { moduleName, moduleInstance, layerIndex: toLayerIndex });
    commit('removeModuleInstanceFromLayer', { moduleName, layerIndex: fromLayerIndex });
  },
  removeAllLayers({ commit, state }) {
    state.layers.forEach((Layer, layerIndex) => {
      Object.keys(Layer.modules).forEach((moduleName) => {
        console.log('Should remove', moduleName);
        store.dispatch(
          'modVModules/removeActiveModule',
          { moduleName },
        );
      });

      commit('removeLayer', { layerIndex });
    });
  },
  presetData({ state }) {
    return state.layers.map((Layer) => {
      const layerData = {};
      layerData.alpha = Layer.alpha;
      layerData.blending = Layer.blending;
      layerData.clearing = Layer.clearing;
      layerData.collapsed = Layer.collapsed;
      layerData.drawToOutput = Layer.drawToOutput;
      layerData.enabled = Layer.enabled;
      layerData.inherit = Layer.inherit;
      layerData.inheritFrom = Layer.inheritFrom;
      layerData.locked = Layer.locked;
      layerData.moduleOrder = Layer.moduleOrder;
      layerData.name = Layer.name;
      layerData.pipeline = Layer.pipeline;
      return layerData;
    });
  },
};

// mutations
const mutations = {
  addModuleToLayer(state, { moduleName, layerIndex, position }) {
    const Layer = state.layers[layerIndex];
    if (Layer.locked) return;

    if (!Layer) {
      throw `Cannot find Layer with index ${layerIndex}`; //eslint-disable-line
    } else {
      Layer.addModule(moduleName, position);
    }
  },
  removeModuleFromLayer(state, { moduleName, layerIndex }) {
    const Layer = state.layers[layerIndex];

    const moduleIndex = Layer.moduleOrder.indexOf(moduleName);
    if (moduleIndex < 0) return;

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
  setName(state, { layerIndex, name }) {
    state.layers[layerIndex].setName(name);
  },
  setLayerFocus(state, { LayerIndex }) {
    Vue.set(state, 'focusedLayer', LayerIndex);
  },
  lock(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'locked', true);
  },
  unlock(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'locked', false);
  },
  setLocked(state, { layerIndex, locked }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'locked', locked);
  },
  collapse(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'collapsed', true);
  },
  uncollapse(state, { layerIndex }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'collapsed', false);
  },
  setCollapsed(state, { layerIndex, collapsed }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'collapsed', collapsed);
  },
  updateLayers(state, { layers }) {
    state.layers = layers;
  },
  updateModuleOrder(state, { layerIndex, order }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'moduleOrder', order);
  },
  setClearing(state, { layerIndex, clearing }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'clearing', clearing);
  },
  setAlpha(state, { layerIndex, alpha }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'alpha', alpha);
  },
  setEnabled(state, { layerIndex, enabled }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'enabled', enabled);
  },
  setInherit(state, { layerIndex, inherit }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'inherit', inherit);
  },
  setInheritFrom(state, { layerIndex, inheritFrom }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'inheritFrom', inheritFrom);
  },
  setPipeline(state, { layerIndex, pipeline }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'pipeline', pipeline);
  },
  setBlending(state, { layerIndex, blending }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'blending', blending);
  },
  setDrawToOutput(state, { layerIndex, drawToOutput }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'drawToOutput', drawToOutput);
  },
  setModuleOrder(state, { layerIndex, moduleOrder }) {
    const Layer = state.layers[layerIndex];
    Vue.set(Layer, 'moduleOrder', moduleOrder);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
