import Vue from 'vue';
// import { modV } from '@/modv';

const state = {
  plugins: {},
};

// getters
const getters = {
  allPlugins: state => Object.keys(state.plugins).map(pluginName => state.plugins[pluginName]),
  plugins: state => state.plugins,
};

// actions
// const actions = {

// };

// mutations
const mutations = {
  addPlugin(state, { plugin }) {
    if (!('name' in plugin)) throw new Error('Plugin must have a name');

    Vue.set(state.plugins, plugin.name, plugin);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  // actions,
  mutations,
};
