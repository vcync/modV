const state = {
  mediaPath: undefined,
  name: 'A modV user'
};

// getters
const getters = {
  mediaPath: state => state.mediaPath,
  name: state => state.name
};

// actions
const actions = {

};

// mutations
const mutations = {
  setMediaPath(state, { path }) {
    state.mediaPath = path;
  },
  setName(state, { name }) {
    state.name = name;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};