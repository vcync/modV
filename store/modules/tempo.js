import store from '../index';

const state = {
  bpm: 120,
  detect: true
};

// getters
const getters = {
  bpm: state => state.bpm,
  detect: state => state.detect
};

// actions
const actions = {
  setBpm({ commit }, { bpm }) {
    commit('setBpm', { bpm });
    store.dispatch('palettes/updateBpm', { bpm });
  }
};

// mutations
const mutations = {
  setBpm(state, { bpm }) {
    state.bpm = bpm;
  },
  setBpmDetect(state, { detect }) {
    state.detect = detect;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};