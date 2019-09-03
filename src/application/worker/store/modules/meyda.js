const state = [];

const actions = {
  addFeature({ commit }, feature) {
    commit("ADD_FEATURE", feature);
  }
};

const mutations = {
  ADD_FEATURE(state, feature) {
    const index = state.indexOf(feature);

    if (index < 0) {
      state.push(feature);
    }
  },
  REMOVE_FEATURE(state, feature) {
    const index = state.indexOf(feature);

    if (index > -1) {
      state.splice(index, 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
