import store from "../index";

const state = {
  width: 0,
  height: 0,
  dpr: 1
};

const getters = {
  area: state => state.width * state.height
};

const actions = {
  async setSize({ commit }, { width, height, dpr }) {
    await store.dispatch("outputs/resize", { width, height });

    const modulesValues = Object.values(store.state.modules.active);
    const modulesLength = modulesValues.length;
    for (let i = 0; i < modulesLength; ++i) {
      const module = modulesValues[i];
      store.dispatch("modules/resize", { moduleId: module.$id, width, height });
    }

    commit("SET_SIZE", { width, height, dpr });
  }
};

const mutations = {
  SET_SIZE(state, { width, height, dpr = 1 }) {
    state.width = width;
    state.height = height;
    state.dpr = dpr;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
