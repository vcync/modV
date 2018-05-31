import Vue from 'vue';
// import { modV } from '@/modv';

const state = {
  plugins: {},
};

// getters
const getters = {
  allPlugins: state => Object.keys(state.plugins).map(pluginName => state.plugins[pluginName]),
  enabledPlugins: state => Object.keys(state.plugins)
    .filter(pluginName => state.plugins[pluginName].enabled)
    .map(pluginName => state.plugins[pluginName]),
  plugins: state => state.plugins,
};

// actions
const actions = {
  presetData({ state }) {
    const pluginData = {};

    Object.keys(state.plugins)
      .filter(pluginKey => state.plugins[pluginKey].enabled)
      .filter(pluginKey => 'presetData' in state.plugins[pluginKey].plugin)
      .forEach((pluginKey) => {
        const plugin = state.plugins[pluginKey].plugin;

        pluginData[pluginKey] = plugin.presetData.save();
      });

    return pluginData;
  },
};

// mutations
const mutations = {
  addPlugin(state, { plugin }) {
    if (!('name' in plugin)) throw new Error('Plugin must have a name');

    Vue.set(state.plugins, plugin.name, { enabled: true, plugin });
  },
  setEnabled(state, { pluginName, enabled }) {
    Vue.set(state.plugins[pluginName], 'enabled', enabled);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
