import modV from "../../application/index.js";

const state = {
  focused: null,
  pinned: [],
};

const getters = {
  focusedOrPinned: (state) => {
    const arr = [...state.pinned];

    if (state.focused && arr.indexOf(state.focused) < 0) {
      arr.push(state.focused);
    }

    return arr;
  },
};

const actions = {
  async removeActiveModule({ commit }, { moduleId, groupId }) {
    commit("SET_FOCUSED", null);

    modV.store.commit("groups/REMOVE_MODULE_FROM_GROUP", {
      moduleId,
      groupId,
    });

    return modV.store.dispatch("modules/removeActiveModule", { moduleId });
  },
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
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
