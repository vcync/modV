import { modV } from '@/modv';

const state = {
  audio: [],
  video: [],
  currentAudioId: '',
  currentVideoId: ''
};

// getters
const getters = {
  audioSources: state => state.audio,
  videoSources: state => state.video,
  currentAudioSource: state => state.currentAudioId,
  currentVideoSource: state => state.currentVideoId,
};

// actions
const actions = {
  setCurrentAudioSource({ commit, state }, { sourceId }) {
    modV.setMediaStreamSource({ audioSourceId: sourceId, videoSourceId: state.currentVideoId }).then(() => {
      commit('setCurrentAudioSource', { sourceId });
    });
  },
  setCurrentVideoSource({ commit, state }, { sourceId }) {
    modV.setMediaStreamSource({ audioSourceId: state.currentAudioId, videoSourceId: sourceId }).then(() => {
      commit('setCurrentVideoSource', { sourceId });
    });
  }
};

// mutations
const mutations = {
  addAudioSource(state, { source }) {
    state.audio.push(source);
  },
  addVideoSource(state, { source }) {
    state.video.push(source);
  },
  setCurrentAudioSource(state, { sourceId }) {
    state.currentAudioId = sourceId;
  },
  setCurrentVideoSource(state, { sourceId }) {
    state.currentVideoId = sourceId;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};