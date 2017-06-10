const state = {
  palettes: new Map()
};

// getters
const getters = {
  allPalettes: state => state.palettes
};

// actions
const actions = {
  createWindow({ commit }, { id, palette }) {
    return new Promise((resolve, reject) => {
      commit('addPalette', id);
    });
  }
};

// mutations
const mutations = {
  addPalette(state, { id, palette }) {
    if(!state.palettes.has(id)) {
      state.palettes.set(id, {});
    } else {
      console.error('Palette with ID', id, 'already exists');
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};