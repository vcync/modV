import Vue from 'vue';

const state = {
  menus: {},
  activeMenus: [],
  visible: false
};

// getters
const getters = {
  menus: state => state.menus,
  menu: state => id => state.menus[id],
  activeMenus: state => state.activeMenus.map(id => state.menus[id]),
  visible: state => state.visible,
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
    const indexToSplice = state.activeMenus.indexOf(id);
    state.activeMenus.splice(indexToSplice, 1);
    state.visible = false;
  },
  popup(state, { id, x, y }) {
    const existingMenuId = state.activeMenus.indexOf(id);
    if(existingMenuId < 0) state.activeMenus.push(id);
    Vue.set(state.menus[id], 'x', x);
    Vue.set(state.menus[id], 'y', y);
    state.visible = true;
  },
  setVisibility(state, { visible }) {
    state.visible = visible;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};