import WindowController from "@/modv/window-controller";
import getLargestWindow from "@/modv/get-largest-window";

const state = {
  windows: [],
  size: { width: 0, height: 0 }
};

// We can't store Window Objects in Vuex because the Observer traversal exceeds the stack size
const externalState = [];

// getters
const getters = {
  allWindows: state => state.windows,
  windowReference: () => index => externalState[index],
  largestWindowSize: state => state.size,
  largestWindowReference() {
    return () => getLargestWindow(state.windows).window || externalState[0];
  },
  largestWindowController() {
    return () => getLargestWindow(state.windows).controller;
  },
  getWindowById: state => id =>
    state.windows.find(windowController => windowController.id === id),
  windowIds: state => state.windows.map(windowController => windowController.id)
};

// actions
const actions = {
  createWindow({ commit }, { Vue }) {
    const number = state.windows.length;
    return new WindowController(Vue, number).then(windowController => {
      const windowRef = windowController.window;
      delete windowController.window;
      commit("addWindow", { windowController, windowRef });
      return windowController;
    });
  },
  destroyWindow({ commit }, { windowRef }) {
    commit("removeWindow", { windowRef });
  },
  resize({ state, commit }, { width, height, dpr }) {
    state.windows.forEach(windowController => {
      windowController.resize(width, height, dpr, false);
    });

    commit("setSize", { width, height, dpr });
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
  },
  setSize(state, { width, height, dpr }) {
    state.size = {
      width,
      height,
      dpr,
      area: width * height
    };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
