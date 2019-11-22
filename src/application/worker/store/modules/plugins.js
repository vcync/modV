import store from "../";

import uuidv4 from "uuid/v4";

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

const state = [];

const getters = {
  preProcessFrame: state => {
    return state.filter(plugin => !!plugin.preProcessFrame);
  }
};

const actions = {
  add({ commit }, plugin) {
    if (!("name" in plugin)) {
      throw new Error("Plugin requires a name");
    }

    if ("store" in plugin) {
      const storeName = plugin.storeName || camelize(plugin.name);
      store.registerModule(storeName, plugin.store);
    }

    plugin.id = uuidv4();
    commit("ADD_PLUGIN", plugin);
  }
};

const mutations = {
  ADD_PLUGIN(state, plugin) {
    state.push(plugin);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
