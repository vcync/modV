const state = {
  audio: [],
  video: []
};

const mutations = {
  ADD_AUDIO_SOURCE(state, { source }) {
    state.audio.push(source);
  },
  ADD_VIDEO_SOURCE(state, { source }) {
    state.video.push(source);
  },
  CLEAR_AUDIO_SOURCES(state) {
    state.audio = [];
  },
  CLEAR_VIDEO_SOURCES(state) {
    state.video = [];
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
