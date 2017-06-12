import store from '@/../store';
import { modV } from '@/modv';

const state = {
  width: 200,
  height: 200,
  useRetina: true,
  previewX: 0,
  previewY: 0,
  previewWidth: 0,
  previewHeight: 0
};

// getters
const getters = {
  width: state => state.width,
  height: state => state.height,
  area: state => state.width * state.height,
  dimensions: (state) => {
    return { width: state.width, height: state.height };
  },
  useRetina: state => state.useRetina,
  previewValues: (state) => {
    return {
      width: state.previewWidth,
      height: state.previewHeight,
      x: state.previewX,
      y: state.previewY
    }
  }
};

// actions
const actions = {
  setDimensions({ commit, state }, { width, height }) {
    const largestWindowReference = store.getters['windows/largestWindowReference']();
    if(width >= largestWindowReference.innerWidth && height >= largestWindowReference.innerHeight) {
      commit('setDimensions', { width, height });

      let dpr = window.devicePixelRatio || 1;
      if(!state.useRetina) dpr = 1;

      modV.resize(state.width, state.height, dpr);
      store.dispatch('modVModules/resizeActive');
      store.dispatch('layers/resize', { width: state.width, height: state.height, dpr });
      store.dispatch('windows/resize', { width: state.width, height: state.height, dpr });
      store.dispatch('size/calculatePreviewCanvasValues');
    }
  },
  setUseRetina({ commit, state }, { useRetina }) {
    let dpr = window.devicePixelRatio || 1;
    if(!useRetina) dpr = 1;

    commit('setUseRetina', { useRetina });
    modV.resize(state.width, state.height, dpr);
    store.dispatch('modVModules/resizeActive');
    store.dispatch('layers/resize', { width: state.width, height: state.height, dpr });
    store.dispatch('windows/resize', { width: state.width, height: state.height, dpr });
  },
  resizePreviewCanvas({ commit, state }) {
    const boundingRect = modV.previewCanvas.getBoundingClientRect();
    modV.previewCanvas.width = boundingRect.width;
    modV.previewCanvas.height = boundingRect.height;
    store.dispatch('size/calculatePreviewCanvasValues');
  },
  calculatePreviewCanvasValues({ commit, state }) {
    // thanks to http://ninolopezweb.com/2016/05/18/how-to-preserve-html5-canvas-aspect-ratio/
    // for great aspect ratio advice!
    const widthToHeight = state.width / state.height;
    let newWidth = modV.previewCanvas.width;
    let newHeight = modV.previewCanvas.height;

    const newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
      newWidth = Math.round(newHeight * widthToHeight);
    } else {
      newHeight = Math.round(newWidth / widthToHeight);
    }

    commit('setPreviewValues', {
      x: Math.round((modV.previewCanvas.width / 2) - (newWidth / 2)),
      y: Math.round((modV.previewCanvas.height / 2) - (newHeight / 2)),
      width: newWidth,
      height: newHeight
    });
  }
};

// mutations
const mutations = {
  setWidth(state, { width }) {
    state.width = width;
  },
  setHeight(state, { height }) {
    state.height = height;
  },
  setDimensions(state, { width, height }) {
    state.width = width;
    state.height = height;
  },
  setUseRetina(state, { useRetina }) {
    state.useRetina = useRetina;
  },
  setPreviewValues(state, { width, height, x, y }) {
    state.previewWidth = width;
    state.previewHeight = height;
    state.previewX = x;
    state.previewY = y;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};