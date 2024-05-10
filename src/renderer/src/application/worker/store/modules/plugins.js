import store from "../";
import getPropDefault from "../../../utils/get-prop-default";

import { v4 as uuidv4 } from "uuid";

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
  async add({ commit }, plugin) {
    if (!("name" in plugin)) {
      throw new Error("Plugin requires a name");
    }

    if ("store" in plugin) {
      const storeName = plugin.storeName || camelize(plugin.name);
      store.registerModule(storeName, plugin.store);
    }

    plugin.$props = {};

    if ("props" in plugin) {
      const keys = Object.keys(plugin.props);
      const keysLength = keys.length;

      for (let i = 0; i < keysLength; i += 1) {
        const key = keys[i];
        const prop = plugin.props[key];

        plugin.$props[key] = await getPropDefault(plugin, key, prop, false);

        if (!plugin.$props[key]) {
          plugin.$props[key] = null;
        }
      }
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
        plugin.init({ store, props: plugin.$props });
      }
    } else {
      if ("shutdown" in plugin) {
        plugin.shutdown({ store, props: plugin.$props });
      }
    }

    commit("SET_PLUGIN_ENABLE", { pluginId, enabled });
  },

  async updateProp({ commit }, { pluginId, prop, data }) {
    const plugin = state.find(item => item.id === pluginId);

    if (!plugin) {
      return false;
    }

    let dataOut = data;

    const propData = plugin.props[prop];
    const currentValue = plugin.$props[prop];
    const { type } = propData;

    if (data === currentValue) {
      return;
    }

    if (store.state.dataTypes[type] && store.state.dataTypes[type].create) {
      dataOut = await store.state.dataTypes[type].create(dataOut);
    }

    if (!Array.isArray(dataOut)) {
      const { strict, min, max, abs } = propData;

      if (strict && typeof min !== "undefined" && typeof max !== "undefined") {
        dataOut = Math.min(Math.max(dataOut, min), max);
      }

      if (abs) {
        dataOut = Math.abs(dataOut);
      }

      if (type === "int") {
        dataOut = Math.round(dataOut);
      }
    }

    commit("UPDATE_PROP", { pluginId, prop, data: dataOut });
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
  },

  UPDATE_PROP(state, { pluginId, prop, data }) {
    const plugin = state.find(item => item.id === pluginId);

    if (!plugin) {
      return false;
    }

    plugin.$props[prop] = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
