const state = {
  pinned: [],
  lastFocused: null,
};

const mutations = {
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
  },

  SET_LAST_FOCUSED(state, id) {
    state.lastFocused = id;
  },

  CLEAR_LAST_FOCUSED(state) {
    state.lastFocused = null;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
