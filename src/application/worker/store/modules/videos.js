import Vue from "vue";
import uuidv4 from "uuid/v4";

const state = {};

const getters = {
  video: state => id => state[id]
};

const actions = {
  createVideoFromPath({ commit }, { path: filePath }) {
    const id = uuidv4();
    const path = `modv://${filePath}`;

    if (typeof window !== "undefined") {
      self.postMessage({
        type: "createWebcodecVideo",
        id,
        path
      });
    }

    commit("CREATE_VIDEO", { id, path });
    return { id };
  },

  assignVideoStream({ commit }, { id, stream, width, height }) {
    commit("UPDATE_VIDEO", { id, stream, width, height });
  }
};

const mutations = {
  CREATE_VIDEO(state, { id, path }) {
    Vue.set(state, id, path);
  },

  UPDATE_VIDEO(state, video) {
    const { id } = video;
    state[id] = { ...state[id], ...video };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
