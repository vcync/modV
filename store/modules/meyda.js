const state = {
  features: []
};

// getters
const getters = {
  features: state => state.features
};

// actions
const actions = {

};

// mutations
const mutations = {
  addFeature(state, { feature }) {
    if(state.features.find(element => element === feature)) return;
    state.features.push(feature);
  },
  removeFeature(state, { feature }) {
    const index = state.features.findIndex(element => element === feature);
    if(index < 0) return;
    state.features.splice(index, 1);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};