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
  activeMenus: state => state.activeMenus.map(id => state.menus[id])
};

// actions
const actions = {
  popdown({ commit }, { id }) {
    commit('popdown', { id });
  },
  popdownAll({ commit }, not) {
    commit('popdownAll', not);
  },
  popup({ commit }, { id, x, y }) {
    commit('popup', { id, x, y });
  }
};

// mutations
const mutations = {
  addMenu(state, { Menu, id, force }) {
    if(state.menus[id] && !force) return;
    Vue.set(state.menus, id, Menu);
  },
  popdown(state, { id }) {
    const indexToSplice = state.activeMenus.indexOf(id);
    if(indexToSplice < 0) return;
    state.activeMenus.splice(indexToSplice, 1);
  },
  popdownAll(state, not) {
    let toKeep = [];
    if(not) toKeep = toKeep.concat(not);

    Vue.set(state, 'activeMenus', toKeep);
  },
  popup(state, { id, x, y }) {
    const existingMenuId = state.activeMenus.indexOf(id);
    if(existingMenuId < 0) state.activeMenus.push(id);
    Vue.set(state.menus[id], 'x', x);
    Vue.set(state.menus[id], 'y', y);
    Vue.set(state.menus[id], 'visible', true);
  },
  editItemProperty(state, { id, index, property, value }) {
    Vue.set(state.menus[id].items[index], property, value);
    console.log(state.menus[id].items[index][property]);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};