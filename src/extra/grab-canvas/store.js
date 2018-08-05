import Vue from 'vue';

const state = {
  selectionX: 0,
  selectionY: 0,
  showCanvas: false,
  url: 'ws://localhost:3000/modV',
};

// mutations
const mutations = {
  setSelection(state, { selectionX, selectionY }) {
    if (selectionX) Vue.set(state, 'selectionX', selectionX);
    if (selectionY) Vue.set(state, 'selectionY', selectionY);
  },

  setShowCanvas(state, { showCanvas }) {
    Vue.set(state, 'showCanvas', showCanvas);
  },

  setUrl(state, { url }) {
    Vue.set(state, 'url', url);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
