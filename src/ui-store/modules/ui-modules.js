const state = {
  focused: null,
  pinned: []
};

const getters = {
  focusedOrPinned: state => {
    const arr = [...state.pinned];

    if (state.focused && arr.indexOf(state.focused) < 0) {
      arr.push(state.focused);
    }

    return arr;
  }
};

const mutations = {
  SET_FOCUSED(state, id) {
    state.focused = id;
  },

  CLEAR_FOCUSED(state) {
    state.focused = null;
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
      state.pinned.splice(index, 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations
};
