import Vue from "vue";

const uuidv4 = require("uuid/v4");

const state = {
  focusedInput: null,
  inputs: {},
  inputLinks: {}
};

const getters = {};

const actions = {
  setFocusedInput({ commit }, id) {
    commit("SET_FOCUSED_INPUT", id);
  },

  addInput({ commit }, { type, location, data }) {
    const input = { type, location, data, id: uuidv4() };
    commit("ADD_INPUT", input);
    return input;
  },

  createInputLink(
    { commit },
    { inputId, location, type = "state", args, min = 0, max = 1 }
  ) {
    const inputLink = { id: inputId, location, type, args, min, max };
    if (!state.inputs[inputId]) {
      return false;
    }

    commit("ADD_INPUT_LINK", inputLink);
    return true;
  },

  removeInputLink({ commit }, { inputId }) {
    if (!state.inputs[inputId]) {
      return false;
    }

    commit("REMOVE_INPUT_LINK", inputId);
    return true;
  }
};

const mutations = {
  SET_FOCUSED_INPUT(state, { id }) {
    state.focusedInput = id;
  },

  ADD_INPUT(state, input) {
    state.inputs[input.id] = input;
  },

  ADD_INPUT_LINK(state, link) {
    Vue.set(state.inputLinks, link.id, link);
  },

  UPDATE_INPUT_LINK(state, { inputId, key, value }) {
    state.inputLinks[inputId][key] = value;
  },

  REMOVE_INPUT_LINK(state, inputId) {
    Vue.delete(state.inputLinks, inputId);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
