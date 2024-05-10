const state = {
  fps: 0
};

const mutations = {
  SET_FPS_MEASURE(state, fps) {
    state.fps = fps;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
