const uuidv4 = require("uuid/v4");

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
  }
};

/**
 * @typedef {Object} outputContext
 *
 * @property {CanvasRenderingContext2D|WebGLRenderingContext|WebGL2RenderingContext|ImageBitmapRenderingContext} context
 * @property {String}  name
 * @property {String}  id
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
      reactToResize = true,
      width = 300,
      height = 300
    }
  ) {
    const context = canvas.getContext(type, options);
    canvas.width = width;
    canvas.height = height;

    const outputContext = await dispatch("addAuxillaryOutput", {
      name,
      context,
      reactToResize
    });

    return outputContext;
  },

  addAuxillaryOutput({ commit }, outputContext) {
    outputContext.id = uuidv4();
    commit("ADD_AUXILLARY", outputContext);
    return outputContext;
  },

  setDebugContext({ commit }, debugCanvas) {
    const context = debugCanvas.getContext("2d");
    commit("SET_DEBUG_CONTEXT", context);
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
    state.auxillary[outputContext.id] = outputContext;
  },

  REMOVE_AUXILLARY(state, id) {
    delete state.auxillary[id];
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
