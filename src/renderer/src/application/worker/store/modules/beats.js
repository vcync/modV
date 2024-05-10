import Vue from "vue";

const state = {
  bpm: 0,
  bpmSource: "beatdetektor",
  kick: false,
  bpmSources: ["beatdetektor", "midi", "tap"]
};

const actions = {
  setBpm({ commit, state }, { bpm, source }) {
    if (!source) {
      throw new Error("Setting the BPM requires a source to be given");
    }

    if (source === state.bpmSource) {
      commit("SET_BPM", { bpm });
    }
  }
};

const mutations = {
  SET_BPM(state, { bpm }) {
    state.bpm = bpm;
  },

  SET_KICK(state, { kick }) {
    state.kick = kick;
  },

  ADD_BPM_SOURCE(state, { source }) {
    state.bpmSources.push(source);
  },

  SET_BPM_SOURCE(state, { source }) {
    Vue.set(state, "bpmSource", source);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
