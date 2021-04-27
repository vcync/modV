const state = {
  audio: [],
  video: [],

  currentAudioSource: null,
  currentVideoSource: null
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
  },

  SET_CURRENT_AUDIO_SOURCE(state, { audioId }) {
    state.currentAudioSource = audioId;
  },

  SET_CURRENT_VIDEO_SOURCE(state, { videoId }) {
    state.currentVideoSource = videoId;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
