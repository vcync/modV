import Vue from "vue";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import store from "../";
import { conformFilePath } from "../../../utils/conform-file-path";

const state = {};

const getters = {
  video: state => id => state[id]?.outputContext?.context.canvas
};

const actions = {
  createVideoFromPath({ rootState, commit }, textureDefinition) {
    const {
      id = uuidv4(),
      options: { path: filePath }
    } = textureDefinition;

    const url = `modv://${path.join(
      rootState.media.path,
      conformFilePath(filePath)
    )}`;

    if (typeof window !== "undefined") {
      self.postMessage({
        type: "createWebcodecVideo",
        id,
        url,
        textureDefinition
      });
    }

    commit("CREATE_VIDEO", { id, path: filePath });
    return { id };
  },

  async assignVideoStream({ commit }, { id, stream, width, height }) {
    const frameReader = stream.getReader();
    const outputContext = await store.dispatch("outputs/getAuxillaryOutput", {
      name: state[id].path,
      options: {
        desynchronized: true
      },
      group: "videos",
      reactToResize: false,
      width,
      height
    });

    frameReader.read().then(function processFrame({ done, value: frame }) {
      const { stream, needsRemoval } = state[id];
      if (done) {
        return;
      }

      // NOTE: all paths below must call frame.close(). Otherwise, the GC won't
      // be fast enough to recollect VideoFrames, and decoding can stall.

      if (needsRemoval) {
        // TODO: There might be a more elegant way of closing a stream, or other
        // events to listen for - do we need to use frameReader.cancel(); somehow?
        frameReader.releaseLock();
        stream.cancel();

        frame.close();

        commit("REMOVE_VIDEO", { id });

        if (typeof window !== "undefined") {
          self.postMessage({
            type: "removeWebcodecVideo",
            id
          });
        }
        return;
      }

      // Processing on 'frame' goes here!
      // E.g. this is where encoding via a VideoEncoder could be set up, or
      // rendering to an OffscreenCanvas.

      outputContext.context.drawImage(frame, 0, 0);
      frame.close();

      frameReader.read().then(processFrame);
    });

    commit("UPDATE_VIDEO", {
      id,
      stream,
      width,
      height,
      frameReader,
      outputContext,
      needsRemoval: false
    });
  },

  async removeVideoById({ commit }, { id }) {
    commit("UPDATE_VIDEO", { id, needsRemoval: true });
  }
};

const mutations = {
  CREATE_VIDEO(state, { id, path }) {
    Vue.set(state, id, { path });
  },

  UPDATE_VIDEO(state, video) {
    const { id } = video;
    state[id] = { ...state[id], ...video };
  },

  REMOVE_VIDEO(state, { id }) {
    delete state[id];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
