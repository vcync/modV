const state = {
  width: 200,
  height: 200
};

// getters
const getters = {
  width: state => state.width,
  height: state => state.height,
  area: state => state.width * state.height,
  dimentions: state => {
    return { width: state.width, height: state.height };
  }
};

// actions
const actions = {

};

// mutations
const mutations = {
  setWidth(state, { width }) {
    state.width = width;
  },
  setHeight(state, { height }) {
    state.height = height;
  },
  setDimentions(state, { width, height }) {
    state.width = width;
    state.height = height;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};