import Vue from "vue";

import uuidv4 from "uuid/v4";
import SWAP from "./common/swap";

function getDefaultState() {
  return {
    focusedInput: { id: null, title: null },
    inputs: {},
    inputLinks: {}
  };
}

const state = getDefaultState();
const swap = getDefaultState();

const getters = {};

const actions = {
  setFocusedInput({ commit }, { id, title, writeToSwap }) {
    commit("SET_FOCUSED_INPUT", { id, title, writeToSwap });
  },

  addInput({ commit }, { type, location, data, id = uuidv4(), writeToSwap }) {
    const input = { type, location, data, id };
    commit("ADD_INPUT", { input, writeToSwap });
    return input;
  },

  createInputLink(
    { commit },
    {
      inputId,
      location,
      type = "state",
      args,
      min = 0,
      max = 1,
      source,
      writeToSwap
    }
  ) {
    const writeTo = writeToSwap ? swap : state;

    if (!source) {
      console.warn("Did not create inputLink. Require source", inputId);

      return false;
    }

    const inputLink = { id: inputId, location, type, args, min, max, source };
    if (!writeTo.inputs[inputId]) {
      console.warn(
        "Did not create inputLink. Could not find input with id",
        inputId
      );

      return false;
    }

    commit("ADD_INPUT_LINK", { inputLink, writeToSwap });
    return true;
  },

  updateInputLink({ commit }, { inputId, key, value, writeToSwap }) {
    commit("UPDATE_INPUT_LINK", { inputId, key, value, writeToSwap });
  },

  removeInputLink({ commit }, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (!writeTo.inputs[inputId]) {
      console.warn(
        "Did not remove inputLink. Could not find input with id",
        inputId
      );

      return false;
    }

    commit("REMOVE_INPUT_LINK", { inputId, writeToSwap });
    return true;
  },

  createPresetData() {
    return state;
  },

  async loadPresetData({ dispatch }, data) {
    await dispatch("setFocusedInput", data.focusedInput);

    const inputs = Object.values(data.inputs);
    for (let i = 0, len = inputs.length; i < len; i++) {
      const input = inputs[i];

      await dispatch("addInput", { ...input, writeToSwap: true });
    }

    const inputLinks = Object.values(data.inputLinks);

    for (let i = 0, len = inputLinks.length; i < len; i++) {
      const link = inputLinks[i];

      await dispatch("createInputLink", {
        inputId: link.id,
        ...link,
        writeToSwap: true
      });
    }
  }
};

const mutations = {
  SET_FOCUSED_INPUT(state, { id, title, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    writeTo.focusedInput.id = id;
    writeTo.focusedInput.title = title;
  },

  ADD_INPUT(state, { input, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    writeTo.inputs[input.id] = input;
  },

  ADD_INPUT_LINK(state, { inputLink, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    Vue.set(writeTo.inputLinks, inputLink.id, inputLink);
  },

  UPDATE_INPUT_LINK(state, { inputId, key, value, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (!writeTo.inputLinks[inputId]) {
      return;
    }

    Vue.set(writeTo.inputLinks[inputId], key, value);
  },

  REMOVE_INPUT_LINK(state, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    Vue.delete(writeTo.inputLinks, inputId);
  },

  SWAP: SWAP(swap, getDefaultState)
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
