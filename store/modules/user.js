const state = {
  mediaPath: undefined,
  name: 'A modV user',
  useRetina: true
};

// getters
const getters = {
  mediaPath: state => state.mediaPath,
  name: state => state.name,
  useRetina: state => state.useRetina
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
  },
  setUseRetina(state, { useRetina }) {
    state.useRetina = useRetina;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};