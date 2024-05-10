function initialState() {
  /**
   * Holds processed media
   *
   * @type {Object}
   */
  return {
    media: {},
    path: null,
  };
}

const getters = {
  projects: (state) =>
    Object.keys(state.media).sort((a, b) => a.localeCompare(b)),
};

const actions = {
  async addMedia({ commit }, { project, folder, item }) {
    commit("ADD", { project, folder, item });
  },

  async setState({ commit }, newState) {
    const store = require("../index.js").default;
    commit("CLEAR_MEDIA_STATE");

    const projectKeys = Object.keys(newState);
    for (let i = 0, len = projectKeys.length; i < len; i++) {
      const projectKey = projectKeys[i];

      const folderKeys = Object.keys(newState[projectKey]);
      for (let j = 0, len = folderKeys.length; j < len; j++) {
        const folderKey = folderKeys[j];

        const items = Object.values(newState[projectKey][folderKey]);
        for (let k = 0, len = items.length; k < len; k++) {
          const item = items[k];

          await store.dispatch("media/addMedia", {
            project: projectKey,
            folder: folderKey,
            item,
          });
        }
      }
    }

    // commit("SET_STATE", newState);
  },

  setMediaDirectoryPath({ commit }, { path }) {
    commit("SET_MEDIA_DIRECTORY_PATH", { path });
  },
};

const mutations = {
  ADD(state, { project, folder, item }) {
    if (!state.media[project]) {
      state.media[project] = {};
    }

    if (!state.media[project][folder]) {
      state.media[project][folder] = {};
    }

    state.media[project][folder][item.name] = item;
  },

  CLEAR_MEDIA_STATE(state) {
    const stateMediaKeys = Object.keys(state.media);
    for (let i = 0, len = stateMediaKeys.length; i < len; i++) {
      const key = stateMediaKeys[i];

      delete state.media[key];
    }
  },

  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      state[key] = s[key];
    }
  },

  SET_MEDIA_DIRECTORY_PATH(state, { path }) {
    state.path = path;
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
