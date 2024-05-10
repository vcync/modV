import Vue from "vue";

function initialState() {
  /**
   * Holds the ReadHandlers
   *
   * @type {Object}
   * @param {Array<ReadHandler>} folderName  Name of a folder in a project. Array of ReadHandlers
   *                                         to use for that folder.
   */
  return {};
}

const getters = {
  ignored: state =>
    Object.values(state).reduce(
      (arr, folder) =>
        arr.concat(folder.reduce((arr, rh) => arr.concat(rh.ignored), [])),
      []
    ),

  forFileType: state => (folder, type) =>
    state[folder] &&
    state[folder].filter(rh => rh.fileTypes.indexOf(type) > -1),

  folders: state => Object.keys(state)
};

const actions = {
  addHandler({ commit }, { readHandler }) {
    return new Promise(resolve => {
      commit("ADD", { folder: readHandler.folder, readHandler });
      resolve();
    });
  }
};

const mutations = {
  ADD(state, { folder, readHandler }) {
    if (!state[folder]) {
      Vue.set(state, folder, []);
    }

    state[folder].push(readHandler);
  },

  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      state[key] = s[key];
    }
  }
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};
