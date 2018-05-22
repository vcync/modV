import stats from '@/extra/stats';
import store from '@/../store';
import { modV } from '@/modv';

const state = {
  mediaPath: undefined,
  name: 'A modV user',
  useRetina: true,
  currentAudioId: '',
  currentVideoId: '',
  showStats: false,
  constrainToOneOne: false,
};

// getters
const getters = {
  mediaPath: state => state.mediaPath,
  name: state => state.name,
  useRetina: state => state.useRetina,
  currentAudioSource: state => state.currentAudioId,
  currentVideoSource: state => state.currentVideoId,
  showStats: state => state.showStats,
  constrainToOneOne: state => state.constrainToOneOne,
};

// actions
const actions = {
  setUseRetina({ commit }, { useRetina }) {
    let dpr = window.devicePixelRatio || 1;
    if (!useRetina) dpr = 1;

    commit('setUseRetina', { useRetina });

    const width = store.getters['size/width'];
    const height = store.getters['size/height'];

    modV.resize(width, height, dpr);
    store.dispatch('modVModules/resizeActive');
    store.dispatch('layers/resize', { width, height, dpr });
    store.dispatch('windows/resize', { width, height, dpr });
  },
  setCurrentAudioSource({ commit, state }, { sourceId }) {
    modV.setMediaStreamSource({
      audioSourceId: sourceId,
      videoSourceId: state.currentVideoId,
    }).then(() => {
      commit('setCurrentAudioSource', { sourceId });
    });
  },
  setCurrentVideoSource({ commit, state }, { sourceId }) {
    modV.setMediaStreamSource({
      audioSourceId: state.currentAudioId,
      videoSourceId: sourceId,
    }).then(() => {
      commit('setCurrentVideoSource', { sourceId });
    });
  },
  setShowStats({ commit }, shouldShowStats) {
    if (shouldShowStats) {
      stats.dom.classList.remove('hidden');
    } else {
      stats.dom.classList.add('hidden');
    }

    commit('setShowStats', shouldShowStats);
  },
  setConstrainToOneOne({ commit }, shouldConstrain) {
    commit('setConstrainToOneOne', shouldConstrain);
    store.dispatch('size/updateSize');
  },
};

// mutations
const mutations = {
  setMediaPath(state, { path }) {
    state.mediaPath = path;
  },
  setName(state, { name }) {
    state.name = name;
  },
  setUseRetina(state, { useRetina }) {
    state.useRetina = useRetina;
  },
  setCurrentAudioSource(state, { sourceId }) {
    state.currentAudioId = sourceId;
  },
  setCurrentVideoSource(state, { sourceId }) {
    state.currentVideoId = sourceId;
  },
  setShowStats(state, shouldShowStats) {
    state.showStats = shouldShowStats;
  },
  setConstrainToOneOne(state, shouldConstrain) {
    state.constrainToOneOne = shouldConstrain;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
