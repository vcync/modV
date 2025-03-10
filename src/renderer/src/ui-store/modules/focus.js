const state = {
  id: null,
  type: null,
};

const actions = {
  setFocus({ commit }, args) {
    if (!args.id) {
      throw new Error("Missing ID");
    }

    if (!args.type) {
      throw new Error("Missing type");
    }

    commit("SET_FOCUS", args);
  },
};

const mutations = {
  SET_FOCUS(state, { id, type }) {
    state.id = id;
    state.type = type;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
