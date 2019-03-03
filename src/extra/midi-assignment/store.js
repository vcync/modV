import Vue from 'vue'

const state = {
  devices: {},
  assignments: {}
}

// getters
const getters = {
  assignments: state => state.assignments,
  assignment: state => key => state.assignments[key],
  devices: state => state.devices,
  midiChannelFromAssignment: state => assignmentString =>
    Object.keys(state.assignments).find(
      channel => state.assignments[channel].variable === assignmentString
    )
}

// actions
const actions = {}

// mutations
const mutations = {
  setAssignment(state, { key, value }) {
    Vue.set(state.assignments, key, value)
  },
  removeAssignment(state, { key }) {
    Vue.delete(state.assignments, key)
  },
  removeAssignments(state, { moduleName }) {
    Object.keys(state.assignments).forEach(key => {
      const assignment = state.assignments[key]
      const data = assignment.variable.split(',')
      if (moduleName === data[0]) {
        Vue.delete(state.assignments, key)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
