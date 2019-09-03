const state = {
  focused: "",
  pinned: []
};

const mutations = {
  SET_FOCUSED(state, id) {
    state.focused = id;
  },

  CLEAR_FOCUSED(state) {
    state.focused = "";
  },

  ADD_PINNED(state, id) {
    if (Array.isArray(id)) {
      state.pinned = state.pinned.concat(id);
    } else {
      state.pinned.push(id);
    }
  },

  REMOVE_PINNED(state, id) {
    const index = state.pinned.indexOf(id);

    if (index > -1) {
      state.splice(index, 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
