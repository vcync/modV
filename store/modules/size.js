import store from '@/../store';
import { modV } from '@/modv';
import Vue from 'vue';

const state = {
  width: 200,
  height: 200,
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
  dimensions: state => ({ width: state.width, height: state.height }),
  previewValues: state => ({
    width: state.previewWidth,
    height: state.previewHeight,
    x: state.previewX,
    y: state.previewY
  })
};

// actions
const actions = {
  updateSize({ state }) {
    store.dispatch('size/setDimensions', {
      width: state.width,
      height: state.height
    });
  },
  setDimensions({ commit, state }, { width, height }) {
    let widthShadow = width;
    let heightShadow = height;

    const largestWindowReference = store.getters['windows/largestWindowReference']();
    if(widthShadow >= largestWindowReference.innerWidth && heightShadow >= largestWindowReference.innerHeight) {
      if(store.getters['user/constrainToOneOne']) {
        if(widthShadow > heightShadow) {
          widthShadow = heightShadow;
        } else {
          heightShadow = widthShadow;
        }
      }

      commit('setDimensions', { width: widthShadow, height: heightShadow });

      let dpr = window.devicePixelRatio || 1;
      if(!store.getters['user/useRetina']) dpr = 1;

      modV.resize(state.width, state.height, dpr);
      store.dispatch('modVModules/resizeActive');
      store.dispatch('layers/resize', { width: state.width, height: state.height, dpr });
      store.dispatch('windows/resize', { width: state.width, height: state.height, dpr });
      store.dispatch('size/calculatePreviewCanvasValues');
    }
  },
  resizePreviewCanvas() {
    modV.previewCanvas.width = modV.previewCanvas.clientWidth;
    modV.previewCanvas.height = modV.previewCanvas.clientHeight;
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
    Vue.set(state, 'width', width);
  },
  setHeight(state, { height }) {
    Vue.set(state, 'height', height);
  },
  setDimensions(state, { width, height }) {
    Vue.set(state, 'width', width);
    Vue.set(state, 'height', height);
  },
  setPreviewValues(state, { width, height, x, y }) {
    Vue.set(state, 'previewWidth', width);
    Vue.set(state, 'previewHeight', height);
    Vue.set(state, 'previewX', x);
    Vue.set(state, 'previewY', y);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
