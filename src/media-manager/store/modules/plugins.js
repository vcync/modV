import Vue from "vue";

/**
 * Holds Plugins
 *
 * @type {Object}
 */
const state = {
  plugins: {},
  pluginData: {}
};

const getters = {};

const actions = {
  addMedia({ commit }, { project, folder, item }) {
    return new Promise(resolve => {
      commit("ADD", { project, folder, item });
      resolve();
    });
  }
};

const mutations = {
  ADD(state, { project, folder, item }) {
    if (!state[project]) {
      Vue.set(state, project, {});
    }

    if (!state[project][folder]) {
      Vue.set(state[project], folder, []);
    }

    state[project][folder].push(item);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
