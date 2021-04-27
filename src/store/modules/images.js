import streamToBlob from "stream-to-blob";
import fs from "fs";
import path from "path";

import Vue from "vue";
import uuidv4 from "uuid/v4";

import store from "../";

const state = {};

const getters = {
  image: state => id => state[id]
};

const actions = {
  async createImageFromPath({ commit }, { path: filePath }) {
    const stream = fs.createReadStream(
      path.join(store.state.media.path, filePath)
    );
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
