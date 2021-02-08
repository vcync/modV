const state = {
  open: []
};

const mutations = {
  ADD_OPEN(state, id) {
    if (Array.isArray(id)) {
      state.open = state.open.concat(id);
    } else {
      state.open.push(id);
    }
  },

  REMOVE_OPEN(state, id) {
    const index = state.open.indexOf(id);

    if (index > -1) {
      state.open.splice(index, 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
