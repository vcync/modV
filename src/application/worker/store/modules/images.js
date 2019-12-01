import streamToBlob from "stream-to-blob";
import fs from "fs";

import Vue from "vue";
import uuidv4 from "uuid/v4";

const state = {};

const getters = {
  image: state => id => state[id]
};

const actions = {
  async createImageFromPath({ commit }, { path }) {
    const stream = fs.createReadStream(path);
    const blob = await streamToBlob(stream);
    const imageBitmap = await createImageBitmap(blob);

    const id = uuidv4();
    commit("SAVE_IMAGE", { id, imageBitmap });
    return { id };
  }
};

const mutations = {
  SAVE_IMAGE(state, { id, imageBitmap }) {
    Vue.set(state, id, imageBitmap);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
