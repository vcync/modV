import { v4 as uuidv4 } from "uuid";

const state = {
  main: null,
  webcam: null,
  // Map of deviceId -> CanvasRenderingContext2D for multi-camera support
  webcams: {},
  // Map of deviceId -> auxillary id to enable cleanup
  webcamAuxByDeviceId: {},
  // Map of screenId -> CanvasRenderingContext2D for multi-screen capture support
  screens: {},
  // Map of screenId -> auxillary id for cleanup
  screenAuxById: {},
  auxillary: {},

  debug: false,
  debugId: "main",
  debugContext: null,
};

const getters = {
  canvasToDebug: (state) => {
    if (state.debugId === "main") {
      return { context: state.main };
    }

    return state.auxillary[state.debugId];
  },

  resizable: (state) =>
    Object.values(state.auxillary).filter((aux) => aux.reactToResize),

  auxillaryCanvas: (state) => (id) => state.auxillary[id].context.canvas,
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

  setWebcamOutputForDevice({ commit }, { deviceId, context, auxId }) {
    commit("SET_WEBCAM_OUTPUT_FOR_DEVICE", { deviceId, context, auxId });
  },

  removeWebcamOutputForDevice({ commit, state, dispatch }, { deviceId }) {
    const auxId = state.webcamAuxByDeviceId[deviceId];
    commit("REMOVE_WEBCAM_OUTPUT_FOR_DEVICE", { deviceId });
    if (auxId) {
      dispatch("removeAuxillaryOutput", auxId);
    }
  },

  setScreenOutput({ commit }, { screenId, context, auxId }) {
    commit("SET_SCREEN_OUTPUT", { screenId, context, auxId });
  },

  removeScreenOutput({ commit, state, dispatch }, { screenId }) {
    const auxId = state.screenAuxById[screenId];
    commit("REMOVE_SCREEN_OUTPUT", { screenId });
    if (auxId) {
      dispatch("removeAuxillaryOutput", auxId);
    }
  },

  async getAuxillaryOutput(
    { dispatch },
    {
      canvas = new OffscreenCanvas(300, 300),
      context,
      name,
      type = "2d",
      options = {},
      group = "",
      id = "",
      reactToResize = true,
      width = state.main ? state.main.canvas.width : 300,
      height = state.main ? state.main.canvas.height : 300,
    },
  ) {
    if (type === "2d") {
      options.storage = "discardable";
    }

    if (!context) {
      canvas.width = width;
      canvas.height = height;
    }

    const canvasContext = context || canvas.getContext(type, options);

    const outputContext = await dispatch("addAuxillaryOutput", {
      name,
      context: canvasContext,
      reactToResize,
      group,
      id,
    });

    return outputContext;
  },

  addAuxillaryOutput({ commit }, outputContext) {
    outputContext.id = outputContext.id || uuidv4();
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
  },
};

const mutations = {
  SET_MAIN_OUTPUT(state, outputContext) {
    state.main = outputContext;
  },

  SET_WEBCAM_OUTPUT(state, outputContext) {
    state.webcam = outputContext;
  },

  SET_WEBCAM_OUTPUT_FOR_DEVICE(state, { deviceId, context, auxId }) {
    state.webcams[deviceId] = context;
    if (auxId) {
      state.webcamAuxByDeviceId[deviceId] = auxId;
    }
    // If there's no default webcam set, use the first registered device as default
    if (!state.webcam) {
      state.webcam = context;
    }
  },

  REMOVE_WEBCAM_OUTPUT_FOR_DEVICE(state, { deviceId }) {
    delete state.webcams[deviceId];
    const auxId = state.webcamAuxByDeviceId[deviceId];
    if (auxId) {
      delete state.webcamAuxByDeviceId[deviceId];
    }
    // If default points to a removed context, unset it (will be set again on next frame/render when needed)
    if (state.webcam && state.webcam === state.webcams[deviceId]) {
      state.webcam = null;
    }
  },

  SET_SCREEN_OUTPUT(state, { screenId, context, auxId }) {
    state.screens[screenId] = context;
    if (auxId) state.screenAuxById[screenId] = auxId;
  },

  REMOVE_SCREEN_OUTPUT(state, { screenId }) {
    delete state.screens[screenId];
    const auxId = state.screenAuxById[screenId];
    if (auxId) delete state.screenAuxById[screenId];
  },

  ADD_AUXILLARY(state, outputContext) {
    state.auxillary[outputContext.id] = outputContext;
  },

  REMOVE_AUXILLARY(state, id) {
    delete state.auxillary[id];
  },

  UPDATE_AUXILLARY(state, { auxillaryId, data }) {
    if (state.auxillary[auxillaryId]) {
      const dataKeys = Object.keys(data);
      const dataKeysLength = dataKeys.length;
      for (let i = 0; i < dataKeysLength; i += 1) {
        const key = dataKeys[i];
        const value = data[key];
        state.auxillary[auxillaryId][key] = value;
      }
    }
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
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
