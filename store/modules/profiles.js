import Vue from 'vue';
import { modV } from '@/modv';

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
  savePaletteToProfile({ commit }, { profileName, paletteName, colors }) {
    const MediaManager = modV.MediaManagerClient;

    MediaManager.send({
      request: 'save-palette',
      profile: profileName,
      name: paletteName,
      payload: colors
    });
  }
};

// mutations
const mutations = {
  addProfile(state, { profileName, images, palettes, presets, videos, modules }) {
    const profile = {};
    profile.images = images || {};
    profile.palettes = palettes || {};
    profile.presets = presets || {};
    profile.videos = videos || {};
    profile.modules = modules || {};

    Vue.set(state.profiles, profileName, profile);
  },
  addPaletteToProfile(state, { profileName, paletteName, colors }) {
    const profile = state.profiles[profileName];
    Vue.set(profile.palettes, paletteName, colors);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};