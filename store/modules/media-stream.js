const state = {
  audio: [],
  video: [],
  currentAudio: {},
  currentVideo: {}
};

// getters
const getters = {
  audioSources: state => state.audio,
  videoSources: state => state.video,
  currentAudioSource: state => state.currentAudio,
  currentVideoSource: state => state.currentVideo,
};

// actions
const actions = {

};

// mutations
const mutations = {
  addAudioSource(state, { source }) {
    state.audio.push(source);
  },
  addVideoSource(state, { source }) {
    state.video.push(source);
  },
  setCurrentAudioSource(state, { source }) {
    state.currentAudio = source;
  },
  setCurrentVideoSource(state, { source }) {
    state.currentVideo = source;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};