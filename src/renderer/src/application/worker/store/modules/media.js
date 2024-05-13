import store from "../";
import streamToBlob from "stream-to-blob";
import media from "../../../../../../main/media-manager/store/modules/media.js";

const fs = require("fs");
const path = require("path");

/**
 * Holds processed media
 *
 * @type {Object}
 */
const state = media.state;

const getters = media.getters;

const actions = {
  ...media.actions,

  async addMedia({ commit }, { project, folder, item }) {
    if (folder === "module" || folder === "isf") {
      const stream = fs.createReadStream(
        path.join(store.state.media.path, item.path),
      );
      const blob = await streamToBlob(stream);

      let text;
      let module;

      try {
        text = await blob.text();
      } catch (e) {
        console.error(`Could not load module`, item.name);
        console.error(e);
        return;
      }

      try {
        module = eval(text).default;
      } catch (e) {
        console.error(`Could not load module`, item.name);
        console.error(e);
        return;
      }

      try {
        await store.dispatch("modules/registerModule", { module, hot: true });
      } catch (e) {
        console.error(`Could not load module`, item.name);
        console.error(e);
        return;
      }
    }

    commit("ADD", { project, folder, item });
  },
};

const mutations = media.mutations;

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
