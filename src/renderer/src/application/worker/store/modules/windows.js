import Vue from "vue";

import { v4 as uuidv4 } from "uuid";

const state = {};

const actions = {
  createWindow({ commit }) {
    const win = {
      width: 300,
      height: 300,
      title: "modV Output",
      pixelRatio: 1,
      x: 0,
      y: 0,
      fullscreen: false,
      backgroundColor: "#000",
      outputId: ""
    };

    win.id = uuidv4();
    commit("ADD_WINDOW", win);

    return win.id;
  }
};

const mutations = {
  ADD_WINDOW(state, window) {
    Vue.set(state, window.id, window);
  },

  UPDATE_WINDOW(state, { id, key, value }) {
    Vue.set(state[id], key, value);
  }

  // REMOVE_WINDOW(state, id) {}
};

export default {
  namespaced: true,
  state,
  // getters,
  actions,
  mutations
};
