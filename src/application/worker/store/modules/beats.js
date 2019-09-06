const state = {
  bpm: 0,
  kick: false
};

const mutations = {
  SET_BPM(state, { bpm }) {
    state.bpm = bpm;
  },

  SET_KICK(state, { kick }) {
    state.kick = kick;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
