const state = {}

const mutations = {
  addItem(state, item) {
    const { name, component } = item

    state[name] = component
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
