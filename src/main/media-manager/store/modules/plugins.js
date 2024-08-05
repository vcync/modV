function initialState() {
  /**
   * Holds Plugins
   *
   * @type {Object}
   */
  return {
    plugins: {},
    pluginData: {},
  };
}

const getters = {};

const actions = {
  addMedia({ commit }, { project, folder, item }) {
    return new Promise((resolve) => {
      commit("ADD", { project, folder, item });
      resolve();
    });
  },
};

const mutations = {
  ADD(state, { project, folder, item }) {
    if (!state[project]) {
      state[project] = {};
    }

    if (!state[project][folder]) {
      state[project][folder] = [];
    }

    state[project][folder].push(item);
  },

  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      state[key] = s[key];
    }
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
