import Vue from 'vue';
import { modV } from '@/modv';

const state = {
  plugins: {},
};

// getters
const getters = {
  allPlugins: state => Object.keys(state.plugins)
    .map(pluginName => state.plugins[pluginName]),

  enabledPlugins: state => Object.keys(state.plugins)
    .filter(pluginName => state.plugins[pluginName].enabled)
    .map(pluginName => state.plugins[pluginName]),

  plugins: state => state.plugins,

  pluginsWithGalleryTab: state => Object.keys(state.plugins).filter(
      pluginName => ('galleryTabComponent' in state.plugins[pluginName].plugin),
    )
    .reduce((obj, pluginName) => {
      obj[pluginName] = state.plugins[pluginName];
      return obj;
    }, {}),
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

  save({ state }, { pluginName }) {
    const MediaManager = modV.MediaManagerClient;
    const plugin = state.plugins[pluginName].plugin;
    const enabled = state.plugins[pluginName].enabled;

    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    if (!('pluginData' in plugin)) {
      throw new Error(`Plugin ${pluginName} does not have a pluginData Object`);
    }

    const save = plugin.pluginData.save;

    if (!save) {
      throw new Error(`Plugin ${pluginName} does not have a save method on pluginData`);
    }

    const payload = {
      meta: {
        enabled,
        name: pluginName,
      },
      values: save(),
    };

    MediaManager.send({
      request: 'save-plugin',
      name: pluginName,
      profile: 'default',
      payload,
    });
  },

  load({ dispatch, state }, { pluginName, data, enabled = true }) {
    const plugin = state.plugins[pluginName].plugin;
    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    if (!data) {
      throw new Error('No data defined');
    }

    if (!('pluginData' in plugin)) {
      throw new Error(`Plugin ${pluginName} does not have a pluginData Object`);
    }

    const load = plugin.pluginData.load;

    if (!load) {
      throw new Error(`Plugin ${pluginName} does not have a load method on pluginData`);
    }

    load(data);

    dispatch('setEnabled', { pluginName, enabled });
  },
  setEnabled({ state, commit }, { pluginName, enabled }) {
    const plugin = state.plugins[pluginName].plugin;
    if (!plugin) {
      throw new Error(`${pluginName} does not exist as a Plugin`);
    }

    if (enabled && plugin.on) {
      plugin.on();
    }

    if (!enabled && plugin.off) {
      plugin.off();
    }

    commit('setEnabled', { pluginName, enabled });
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
