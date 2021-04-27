import Vue from "vue";
import uuidv4 from "uuid/v4";

const state = {
  main: null,
  webcam: null,
  auxillary: {},

  debug: false,
  debugId: "main",
  debugContext: null
};

const getters = {
  canvasToDebug: state => {
    if (state.debugId === "main") {
      return { context: state.main };
    }

    return state.auxillary[state.debugId];
  },

  resizable: state =>
    Object.values(state.auxillary).filter(aux => aux.reactToResize),

  auxillaryCanvas: state => id => state.auxillary[id].context.canvas
};

/**
 * @typedef {Object} outputContext
 *
 * @property {CanvasRenderingContext2D|WebGLRenderingContext|WebGL2RenderingContext|ImageBitmapRenderingContext} context
 * @property {String}  name
 * @property {String}  id
 * @property {String}  group
 * @property {Boolean} reactToResize
 */

const actions = {
  setMainOutput({ commit }, context) {
    commit("SET_MAIN_OUTPUT", context);
  },

  setWebcamOutput({ commit }, context) {
    commit("SET_WEBCAM_OUTPUT", context);
  },

  async getAuxillaryOutput(
    { dispatch },
    {
      canvas = new OffscreenCanvas(300, 300),
      name,
      type = "2d",
      options = {},
      group = "",
      reactToResize = true,
      width = state.main ? state.main.canvas.width : 300,
      height = state.main ? state.main.canvas.height : 300
    }
  ) {
    if (type === "2d") {
      options.storage = "discardable";
    }

    const context = canvas.getContext(type, options);
    canvas.width = width;
    canvas.height = height;

    const outputContext = await dispatch("addAuxillaryOutput", {
      name,
      context,
      reactToResize,
      group
    });

    return outputContext;
  },

  addAuxillaryOutput({ commit }, outputContext) {
    outputContext.id = uuidv4();
    commit("ADD_AUXILLARY", outputContext);
    return outputContext;
  },

  removeAuxillaryOutput({ commit }, outputContextId) {
    commit("REMOVE_AUXILLARY", outputContextId);
  },

  setDebugContext({ commit }, debugCanvas) {
    const context = debugCanvas.getContext("2d");
    commit("SET_DEBUG_CONTEXT", context);
  },

  resize({ commit, getters }, { width, height }) {
    const resizable = getters.resizable;

    commit("RESIZE_MAIN_OUTPUT", { width, height });

    for (let i = 0, len = resizable.length; i < len; i++) {
      const outputContext = resizable[i];

      commit("RESIZE_AUXILLARY", { id: outputContext.id, width, height });
    }
  },

  resizeDebug({ commit }, { width, height }) {
    commit("RESIZE_DEBUG", { width, height });
  }
};

const mutations = {
  SET_MAIN_OUTPUT(state, outputContext) {
    state.main = outputContext;
  },

  SET_WEBCAM_OUTPUT(state, outputContext) {
    state.webcam = outputContext;
  },

  ADD_AUXILLARY(state, outputContext) {
    Vue.set(state.auxillary, outputContext.id, outputContext);
  },

  REMOVE_AUXILLARY(state, id) {
    Vue.delete(state.auxillary, id);
  },

  RESIZE_MAIN_OUTPUT(state, { width, height }) {
    if (!state.main.canvas) {
      return;
    }

    state.main.canvas.width = width;
    state.main.canvas.height = height;
  },

  RESIZE_AUXILLARY(state, { id, width, height }) {
    if (!state.auxillary[id].context.canvas) {
      return;
    }
    state.auxillary[id].context.canvas.width = width;
    state.auxillary[id].context.canvas.height = height;
  },

  TOGGLE_DEBUG(state, debug) {
    state.debug = debug;
  },

  RESIZE_DEBUG(state, { width, height }) {
    if (!state.debugContext.canvas) {
      return;
    }

    if (width) {
      state.debugContext.canvas.width = width;
    }

    if (height) {
      state.debugContext.canvas.height = height;
    }
  },

  SET_DEBUG_ID(state, id) {
    state.debugId = id;
  },

  SET_DEBUG_CONTEXT(state, context) {
    state.debugContext = context;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
