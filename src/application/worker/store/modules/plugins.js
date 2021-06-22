import store from "../";

import uuidv4 from "uuid/v4";

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) {
      return "";
    } // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

const state = [];

const getters = {
  preProcessFrame: state => {
    return state.filter(plugin => !!plugin.preProcessFrame && plugin.enabled);
  },

  postProcessFrame: state => {
    return state.filter(plugin => !!plugin.postProcessFrame && plugin.enabled);
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
    plugin.enabled = false;
    commit("ADD_PLUGIN", plugin);
  },

  setEnabled({ commit }, { pluginId, enabled }) {
    const plugin = state.find(item => item.id === pluginId);

    if (!plugin) {
      return false;
    }

    if (enabled) {
      if ("init" in plugin) {
        plugin.init({ store });
      }
    } else {
      if ("shutdown" in plugin) {
        plugin.shutdown({ store });
      }
    }

    commit("SET_PLUGIN_ENABLE", { pluginId, enabled });
  }
};

const mutations = {
  ADD_PLUGIN(state, plugin) {
    state.push(plugin);
  },

  SET_PLUGIN_ENABLE(state, { pluginId, enabled }) {
    const plugin = state.find(item => item.id === pluginId);

    if (!plugin) {
      return false;
    }

    plugin.enabled = enabled;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
