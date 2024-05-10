import streamToBlob from "stream-to-blob";
import fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import store from "../";
import { conformFilePath } from "../../../utils/conform-file-path";

const state = {};

const getters = {
  image: (state) => (id) => state[id],
};

const actions = {
  async createImageFromPath({ commit }, { path: filePath }) {
    let stream;
    let joinedFilePath;

    try {
      joinedFilePath = path.join(
        store.state.media.path,
        conformFilePath(filePath),
      );
    } catch (e) {
      console.log(e);
    }

    stream = fs.createReadStream(joinedFilePath);

    if (!stream) {
      return {};
    }

    const blob = await streamToBlob(stream);
    const imageBitmap = await createImageBitmap(blob);

    const id = uuidv4();
    commit("SAVE_IMAGE", { id, imageBitmap });
    return { id };
  },
};

const mutations = {
  SAVE_IMAGE(state, { id, imageBitmap }) {
    state[id] = imageBitmap;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
