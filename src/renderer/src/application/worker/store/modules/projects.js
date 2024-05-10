const state = {
  currentProject: "default"
};

const actions = {
  setCurrentProject({ commit }, projectName) {
    commit("SET_CURRENT_PROJECT", projectName);
  }
};

const mutations = {
  SET_CURRENT_PROJECT(state, currentProject) {
    state.currentProject = currentProject;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
