const state = {
  audio: [],
  video: []
}

// getters
const getters = {
  audioSources: state => state.audio,
  videoSources: state => state.video
}

// actions
const actions = {}

// mutations
const mutations = {
  addAudioSource(state, { source }) {
    state.audio.push(source)
  },
  addVideoSource(state, { source }) {
    state.video.push(source)
  },
  clearAudioSources(state) {
    state.audio = []
  },
  clearVideoSources(state) {
    state.video = []
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
