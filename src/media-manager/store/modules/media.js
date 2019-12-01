import Vue from "vue";

/**
 * Holds processed media
 *
 * @type {Object}
 */
const state = {};

const getters = {};

const actions = {
  addMedia({ commit }, { project, folder, item }) {
    return new Promise(resolve => {
      commit("ADD", { project, folder, item });
      resolve();
    });
  },

  setState({ commit }, newState) {
    commit("SET_STATE", newState);
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

  SET_STATE(state, newState) {
    const stateKeys = Object.keys(state);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      delete state[key];
    }

    const newStateKeys = Object.keys(newState);
    for (let i = 0, len = newStateKeys.length; i < len; i++) {
      const key = newStateKeys[i];

      state[key] = newState[key];
    }

    Vue.set(state, newState);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
