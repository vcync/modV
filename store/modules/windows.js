import WindowController from '@/modv/window-controller';
import getLargestWindow from '@/modv/get-largest-window';

const state = {
  windows: []
};

// We can't store Window Objects in Vuex because the Observer traversal exceeds the stack size
const externalState = [];
// getters
const getters = {
  allWindows: state => state.windows,
  windowReference: () => index => externalState[index],
  largestWindowReference() {
    return getLargestWindow(state.windows) || externalState[0];
  }
};

// actions
const actions = {
  createWindow({ commit }) {
    return new WindowController().then((windowController) => {
      const windowRef = windowController.window;
      delete windowController.window;
      commit('addWindow', { windowController, windowRef });
      return windowController;
    });
  },
  destroyWindow({ commit }, { windowRef }) {
    commit('removeWindow', { windowRef });
  }
};

// mutations
const mutations = {
  addWindow(state, { windowController, windowRef }) {
    const index = state.windows.length;
    windowController.window = index;
    state.windows.push(windowController);
    externalState.push(windowRef);
    getters.largestWindowReference();
  },
  removeWindow(state, { windowRef }) {
    state.windows.splice(windowRef, 1);
    externalState.splice(windowRef, 1);
    getters.largestWindowReference();
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};