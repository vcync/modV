const state = {
  pinnedPanels: []
}

// getters
const getters = {
  pinnedPanels: state => state.pinnedPanels
}

// actions
const actions = {}

// mutations
const mutations = {
  pinPanel(state, { moduleName }) {
    state.pinnedPanels.push(moduleName)
  },
  unpinPanel(state, { moduleName }) {
    state.pinnedPanels.splice(state.pinnedPanels.indexOf(moduleName), 1)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
