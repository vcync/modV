const state = {
  fps: 60
};

const getters = {
  interval: state => 1000 / state.fps
};

const actions = {
  setFPS({ commit }, { fps }) {
    if (!fps) {
      throw new Error("No FPS given");
    }

    commit("SET_FPS", { fps });
  }
};

const mutations = {
  SET_FPS(state, { fps }) {
    state.fps = fps;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
