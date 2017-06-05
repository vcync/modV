import store from '@/../store';
import modV from '@/modv';

const state = {
  width: 200,
  height: 200,
  useRetina: true
};

// getters
const getters = {
  width: state => state.width,
  height: state => state.height,
  area: state => state.width * state.height,
  dimensions: (state) => {
    return { width: state.width, height: state.height };
  },
  useRetina: state => state.useRetina
};

// actions
const actions = {
  setDimensions({ commit, state }, { width, height }) {
    const largestWindowReference = store.getters['windows/largestWindowReference']();
    if(width >= largestWindowReference.innerWidth && height >= largestWindowReference.innerHeight) {
      commit('setDimensions', { width, height });

      let dpr = window.devicePixelRatio || 1;
      if(!state.useRetina) dpr = 1;

      modV.resize(state.width, state.width, dpr);
      store.dispatch('modVModules/resizeActive');
      store.dispatch('windows/resize', { width: state.width, height: state.height, dpr });
    }
  },
  setUseRetina({ commit, state }, { useRetina }) {
    let dpr = window.devicePixelRatio || 1;
    if(!useRetina) dpr = 1;

    commit('setUseRetina', { useRetina });
    modV.resize(state.width, state.height, dpr);
    store.dispatch('modVModules/resizeActive');
    store.dispatch('windows/resize', { width: state.width, height: state.height, dpr, emit: false });
  }
};

// mutations
const mutations = {
  setWidth(state, { width }) {
    state.width = width;
  },
  setHeight(state, { height }) {
    state.height = height;
  },
  setDimensions(state, { width, height }) {
    state.width = width;
    state.height = height;
  },
  setUseRetina(state, { useRetina }) {
    state.useRetina = useRetina;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};