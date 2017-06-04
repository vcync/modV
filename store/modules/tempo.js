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

};

// mutations
const mutations = {
  setBpm(state, { tempo }) {
    state.bpm = tempo;
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