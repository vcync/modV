import Vue from 'vue';

const state = {
  profiles: {}
};

// getters
const getters = {
  allProfiles: state => state.profiles,
  getPaletteFromProfile: state => ({ paletteName, profileName }) => state.profiles[profileName].palettes[paletteName]
};

// actions
const actions = {
  // defaultAction({ commit }, { }) {
  // }
};

// mutations
const mutations = {
  addProfile(state, { profileName, images, palettes, presets, videos }) {
    const profile = {};
    profile.images = images || {};
    profile.palettes = palettes || {};
    profile.presets = presets || {};
    profile.videos = videos || {};

    Vue.set(state.profiles, profileName, profile);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};