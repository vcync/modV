const state = {};

const getters = {
  renderersWithTick: state => {
    const keys = Object.keys(state);
    return keys
      .map(key => state[key].tick && state[key])
      .filter(renderer => renderer);
  }
};

const mutations = {
  ADD_RENDERER(state, renderer) {
    state[renderer.name] = renderer;
  },
  REMOVE_RENDERER(state, name) {
    delete state[name];
  }
};

export default {
  namespaced: true,
  getters,
  state,
  mutations
};
