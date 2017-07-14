import Vue from 'vue';

const state = {
  devices: {},
  assignments: {}
};

// getters
const getters = {
  assignments: state => state.assignments,
  assignment: state => key => state.assignments[key],
  devices: state => state.devices
};

// actions
const actions = {

};

// mutations
const mutations = {
  setAssignment(state, { key, value }) {
    Vue.set(state.assignments, key, value);
  },
  removeAssignment(state, { key }) {
    Vue.delete(state.assignments, key);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};