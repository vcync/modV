import store from "../index";

const state = {
  width: 0,
  height: 0
};

const getters = {
  area: state => state.width * state.height
};

const actions = {
  setSize({ commit }, { width, height }) {
    store.state.outputs.main.canvas.width = width;
    store.state.outputs.main.canvas.height = height;

    const auxKeys = Object.keys(store.state.outputs.auxillary);
    const auxLength = auxKeys.length;
    for (let i = 0; i < auxLength; ++i) {
      const { reactToResize, context } = store.state.outputs.auxillary[
        auxKeys[i]
      ];
      if (!reactToResize) {
        continue;
      }

      context.canvas.width = width;
      context.canvas.height = height;
    }

    const modulesKeys = Object.keys(store.state.modules.active);
    const modulesLength = Object.keys(modulesKeys).length;
    for (let i = 0; i < modulesLength; ++i) {
      const module = store.state.modules.active[modulesKeys[i]];
      if (module.resize && !module.isGallery) {
        module.resize({
          canvas: store.state.outputs.main.canvas
        });
      }
    }

    commit("SET_SIZE", { width, height });
  }
};

const mutations = {
  SET_SIZE(state, { width, height }) {
    state.width = width;
    state.height = height;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
