import Vue from "vue";

function initialState() {
  /**
   * Holds processed media
   *
   * @type {Object}
   */
  return {};
}

const getters = {
  projects: state => Object.keys(state).sort((a, b) => a.localeCompare(b))
};

const actions = {
  async addMedia({ commit }, { project, folder, item }) {
    commit("ADD", { project, folder, item });
  },

  async setState({ commit }, newState) {
    const store = require("../index.js").default;
    commit("CLEAR_STATE");

    const projectKeys = Object.keys(newState);
    for (let i = 0, len = projectKeys.length; i < len; i++) {
      const projectKey = projectKeys[i];

      const folderKeys = Object.keys(newState[projectKey]);
      for (let j = 0, len = folderKeys.length; j < len; j++) {
        const folderKey = folderKeys[j];

        const items = Object.values(newState[projectKey][folderKey]);
        for (let k = 0, len = items.length; k < len; k++) {
          const item = items[k];

          await store.dispatch("media/addMedia", {
            project: projectKey,
            folder: folderKey,
            item
          });
        }
      }
    }

    // commit("SET_STATE", newState);
  }
};

const mutations = {
  ADD(state, { project, folder, item }) {
    if (!state[project]) {
      Vue.set(state, project, {});
    }

    if (!state[project][folder]) {
      Vue.set(state[project], folder, {});
    }

    state[project][folder][item.name] = item;
  },

  CLEAR_STATE(state) {
    const stateKeys = Object.keys(state);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      Vue.delete(state, key);
    }
  },

  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      state[key] = s[key];
    }
  }
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};
