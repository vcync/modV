import Vue from 'vue';
import { modV } from '@/modv';

const state = {
  palettes: {}
};

// getters
const getters = {
  allPalettes: state => state.palettes
};

// actions
const actions = {
  createPalette({ commit }, { id, colors, duration, moduleName, variable }) {
    if(id in state.palettes === true) return;

    let colorsPassed = [];
    let durationPassed = 300;

    if(colors) colorsPassed = colors;
    if(duration) durationPassed = duration;

    modV.workers.palette.createPalette(id, colorsPassed, durationPassed);
    commit('addPalette', { id, colors, duration, moduleName, variable });
  },
  updateBpm({ commit }, { bpm }) {
    Object.keys(state.palettes).forEach((id) => {
      modV.workers.palette.setPalette(id, {
        bpm
      });
    });
  }
};

// mutations
const mutations = {
  addPalette(state, { id, colors, duration, moduleName, variable }) {
    if(id in state.palettes === false) {
      Vue.set(state.palettes, id, {
        colors,
        duration,
        moduleName,
        variable
      });
    }
    console.log(state.palettes);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};