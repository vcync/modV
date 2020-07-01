import Vue from "vue";
import { modV } from "@/modv";
import store from "../index";

const state = {
  palettes: {}
};

// getters
const getters = {
  allPalettes: state => state.palettes
};

// actions
const actions = {
  createPalette(
    { commit, state },
    { override, id, colors, duration, moduleName, returnFormat, variable }
  ) {
    return new Promise(resolve => {
      if (id in state.palettes === true && !override) {
        resolve(state.palettes[id]);
        return;
      }

      let colorsPassed = [];
      let durationPassed = 300;

      if (colors) colorsPassed = colors;
      if (duration) durationPassed = duration;

      modV.workers.palette.createPalette(
        id,
        colorsPassed,
        durationPassed,
        returnFormat
      );
      commit("addPalette", {
        id,
        colors,
        duration,
        moduleName,
        variable,
        returnFormat
      });
      resolve(state.palettes[id]);
    });
  },
  async removePalette({ commit }, { id }) {
    modV.workers.palette.removePalette(id);
    commit("removePalette", { id });
  },
  updateBpm({}, { bpm }) { //eslint-disable-line
    Object.keys(state.palettes).forEach(id => {
      modV.workers.palette.setPalette(id, {
        bpm
      });
    });
  },
  updateColors({ commit }, { id, colors }) {
    modV.workers.palette.setPalette(id, {
      colors
    });

    commit("updateColors", { id, colors });
  },
  updateDuration({ commit }, { id, duration }) {
    commit("updateDuration", { id, duration });

    modV.workers.palette.setPalette(id, {
      timePeriod: duration
    });
  },
  updateUseBpm({ commit }, { id, useBpm }) {
    modV.workers.palette.setPalette(id, {
      useBpm
    });

    commit("updateUseBpm", { id, useBpm });
  },
  updateBpmDivision({ commit }, { id, bpmDivision }) {
    modV.workers.palette.setPalette(id, {
      bpmDivision
    });

    commit("updateBpmDivision", { id, bpmDivision });
  },
  stepUpdate({ commit }, { id, currentStep, currentColor }) {
    if (!(id in state.palettes)) return;

    commit("updatePalette", {
      id,
      props: {
        currentStep,
        currentColor
      }
    });
  },
  presetData({ state }, modulesToGet) {
    const data = {};

    Object.keys(state.palettes).forEach(key => {
      const paletteData = state.palettes[key];
      if (modulesToGet.includes(paletteData.moduleName)) {
        data[key] = paletteData;
      }
    });

    return data;
  },
  async loadPreset({ actions }, { paletteData }) {
    Object.keys(paletteData).forEach(async id => {
      const palette = paletteData[id];

      await store.dispatch("palettes/createPalette", {
        id,
        override: true,
        ...palette
      });
    });
  }
};

// mutations
const mutations = {
  addPalette(
    state,
    { id, colors, duration, useBpm, bpmDivision, moduleName, variable }
  ) {
    if (id in state.palettes === false) {
      Vue.set(state.palettes, id, {
        bpmDivision: bpmDivision || 16,
        duration: duration || 500,
        useBpm: useBpm || false,
        moduleName,
        colors,
        variable,
        currentColor: 0,
        currentStep: ""
      });
    }
  },
  removePalette(state, { id }) {
    Vue.delete(state.palettes, id);
  },
  updatePalette(state, { id, props }) {
    state.palettes[id] = Object.assign({}, state.palettes[id], props);
  },
  updateColors(state, { id, colors }) {
    if (id in state.palettes) {
      state.palettes[id].colors = colors;
    }
  },
  updateDuration(state, { id, duration }) {
    if (id in state.palettes) {
      state.palettes[id].duration = duration;
    }
  },
  updateUseBpm(state, { id, useBpm }) {
    if (id in state.palettes) {
      state.palettes[id].useBpm = useBpm;
    }
  },
  updateBpmDivision(state, { id, bpmDivision }) {
    if (id in state.palettes) {
      state.palettes[id].bpmDivision = bpmDivision;
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
