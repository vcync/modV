const state = {};

const mutations = {
  addRenderer(state, renderer) {
    state[renderer.name] = renderer;
  },
  removeRenderer(state, name) {
    delete state[name];
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
