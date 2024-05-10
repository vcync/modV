function initialState() {
  /**
   * Holds the SaveHandler
   *
   * @type {Object}
   * @param {Array<SaveHandler>} folderName  Name of a folder in a project. Array of SaveHandlers
   *                                         to use for that folder.
   */
  return {};
}

const getters = {
  ignored: (state) =>
    Object.values(state).reduce(
      (arr, folder) =>
        arr.concat(folder.reduce((arr, sh) => arr.concat(sh.ignored), [])),
      [],
    ),

  forFileType: (state) => (folder, type) =>
    state[folder] &&
    state[folder].filter((sh) => sh.fileTypes.indexOf(type) > -1),

  folders: (state) => Object.keys(state),
};

const actions = {
  addHandler({ commit }, { saveHandler }) {
    return new Promise((resolve) => {
      commit("ADD", saveHandler);
      resolve();
    });
  },
};

const mutations = {
  ADD(state, saveHandler) {
    state[saveHandler.folder] = saveHandler;
  },

  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];

      state[key] = s[key];
    }
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
