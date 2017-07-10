import Vue from 'vue';

const state = {
  menus: {}
};

// getters
const getters = {
  menus: state => state.menus,
  menu: state => id => state.menus[id]
};

// actions
const actions = {
  popdown({ commit }, { id }) {
    commit('popdown', { id });
  },
  popup({ commit }, { id, x, y }) {
    commit('popup', { id, x, y });
  }
};

// mutations
const mutations = {
  addMenu(state, { Menu, id }) {
    Vue.set(state.menus, id, Menu);
  },
  popdown(state, { id }) {
    state.menus[id].popdown();
  },
  popup(state, { id, x, y }) {
    state.menus[id].popup(x, y);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};