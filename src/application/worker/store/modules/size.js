import store from "../index";

const state = {
  width: 0,
  height: 0
};

const getters = {
  area: state => state.width * state.height
};

const actions = {
  async setSize({ commit }, { width, height }) {
    await store.dispatch("outputs/resize", { width, height });

    const modulesValues = Object.values(store.state.modules.active);
    const modulesLength = modulesValues.length;
    for (let i = 0; i < modulesLength; ++i) {
      const module = modulesValues[i];
      store.dispatch("modules/resize", { moduleId: module.$id, width, height });
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
