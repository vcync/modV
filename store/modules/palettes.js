import { modV } from '@/modv';

const state = {
  palettes: new Map()
};

// getters
const getters = {
  allPalettes: state => state.palettes
};

// actions
const actions = {
  createPalette({ commit }, { id, colors, duration }) {
    if(state.palettes.has(id)) return;

    let colorsPassed = [];
    let durationPassed = 300;

    if(colors) colorsPassed = colors;
    if(duration) durationPassed = duration;

    return new Promise((resolve) => {
      modV.workers.palette.createPalette(id, colorsPassed, durationPassed);
      commit('addPalette', id);
      resolve();
    });
  }
};

// mutations
const mutations = {
  addPalette(state, { id }) {
    if(!state.palettes.has(id)) {
      state.palettes.set(id, {});
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};