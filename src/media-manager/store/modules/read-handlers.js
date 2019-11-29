import Vue from "vue";

/**
 * Holds the ReadHandlers
 *
 * @type {Object}
 * @param {Array<ReadHandler>} folderName  Name of a folder in a project. Array of ReadHandlers
 *                                         to use for that folder.
 */
const state = {};

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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
