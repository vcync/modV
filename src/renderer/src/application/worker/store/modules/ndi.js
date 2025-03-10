import { v4 as uuidv4 } from "uuid";
import store from "../";
import { setupGrandiose as getGrandiose } from "../../../setup-grandiose";

const state = {
  outputEnabled: false,
  outputName: "modV",
  outputWidth: 1920,
  outputHeight: 1080,
  followModVOutputSize: true,
  followModVFps: true,
  outputTargetFps: 60,

  discovering: false,
  timeout: 30 * 1000,

  receivers: {
    // "receiver-uuidv4": {
    //   reciver: {}, // the receiver instance,
    //   outputId: "output-uuidv4", // id of an output canvas
    //   enabled: false // whether we should do anything with the incoming data from this receiver
    // }
  },

  sources: [
    // {
    //   name: "GINGER (Intel(R) HD Graphics 520 1)",
    //   urlAddress: "169.254.82.1:5962"
    // },
    // { name: "GINGER (Test Pattern)", urlAddress: "169.254.82.1:5961" },
    // {
    //   name: "GINGER (TOSHIBA Web Camera - HD)",
    //   urlAddress: "169.254.82.1:5963"
    // }
  ],

  discoveryOptions: {
    showLocalSources: true,
  },
};

async function checkCpu() {
  if (!(await (await getGrandiose()).isSupportedCPU())) {
    throw new Error("Your CPU is not supported for NDI");
  }
}

async function waitForFrame(receiverContext) {
  const { receiver, outputId } = receiverContext;
  const {
    context,
    context: { canvas },
  } = store.state.outputs.auxillary[outputId];

  let dataFrame;

  try {
    dataFrame = await receiver.data();
  } catch (e) {
    console.error(e);

    if (receiverContext.enabled) {
      waitForFrame(receiverContext);
    }
  }

  if (dataFrame.type === "video") {
    const { xres, yres, data: uint8array } = dataFrame;
    const ui8c = new Uint8ClampedArray(
      uint8array.buffer,
      uint8array.byteOffset,
      uint8array.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT,
    );
    const image = new ImageData(ui8c, dataFrame.xres);

    if (canvas.width !== xres || canvas.height !== yres) {
      canvas.width = xres;
      canvas.height = yres;
    }

    context.putImageData(image, 0, 0);
  }

  if (receiverContext.enabled) {
    waitForFrame(receiverContext);
  }
}

const actions = {
  async discoverSources({ commit }) {
    checkCpu();

    commit("SET_DISCOVERING", true);

    try {
      const result = await (
        await getGrandiose()
      ).find({
        ...state.discoveryOptions,
      });

      const sources = result.sources();

      commit("SET_SOURCES", sources);
    } catch (e) {
      console.log(e);
    }

    commit("SET_DISCOVERING", false);
  },

  setDiscoveryOptions({ commit }, options) {
    commit("SET_DISCOVERY_OPTIONS", { ...state.discoveryOptions, ...options });
  },

  async createReceiver({ commit }, receiverOptions) {
    const grandiose = await getGrandiose();

    receiverOptions.colorFormat = grandiose.COLOR_FORMAT_RGBX_RGBA;
    receiverOptions.bandwidth = grandiose.BANDWIDTH_HIGHEST;
    receiverOptions.allowVideoFields = false;

    const receiver = await grandiose.receive(receiverOptions);

    const outputContext = await store.dispatch("outputs/getAuxillaryOutput", {
      name: receiverOptions.source.name,
      group: "NDI",
      reactToResize: false,
    });

    const receiverId = uuidv4();
    const receiverContext = {
      id: receiverId,
      outputId: outputContext.id,
      receiver,
      enabled: false,
    };

    commit("ADD_RECIEVER", receiverContext);

    return receiverContext;
  },

  async enableReceiver({ commit }, { receiverId }) {
    const receiverContext = state.receivers[receiverId];

    if (!receiverContext) {
      throw new Error(`No receiver found with id ${receiverId}`);
    }

    receiverContext.enabled = true;

    commit("UPDATE_RECIEVER", receiverContext);

    waitForFrame(receiverContext);
  },

  disableReceiver({ commit }, { receiverId }) {
    const receiverContext = state.receivers[receiverId];

    if (!receiverContext) {
      throw new Error(`No receiver found with id ${receiverId}`);
    }

    receiverContext.enabled = false;

    commit("UPDATE_RECIEVER", receiverContext);
  },

  async removeReceiver({ commit }, { receiverId }) {
    const receiverContext = state.receivers[receiverId];

    if (!receiverContext) {
      throw new Error(`No receiver found with id ${receiverId}`);
    }

    await store.dispatch("ndi/disableReceiver", {
      receiverId: receiverContext.id,
    });

    await store.dispatch(
      "outputs/removeAuxillaryOutput",
      receiverContext.outputId,
    );

    commit("DELETE_RECIEVER", receiverContext);
  },
};

const mutations = {
  SET_SOURCES(state, sources) {
    state.sources = sources;
  },

  SET_DISCOVERING(state, discovering) {
    state.discovering = discovering;
  },

  SET_DISCOVERY_OPTIONS(state, options) {
    state.discoveryOptions = options;
  },

  ADD_RECIEVER(state, receiverContext) {
    state.receivers[receiverContext.id] = receiverContext;
  },

  UPDATE_RECIEVER(state, receiverContext) {
    state.receivers[receiverContext.id] = receiverContext;
  },

  DELETE_RECIEVER(state, receiverContext) {
    delete state.receivers[receiverContext.id];
  },

  SET_OUTPUT_ENABLED(state, enabled) {
    state.outputEnabled = enabled;
  },

  SET_OUTPUT_NAME(state, name = "modV") {
    state.outputName = name;
  },

  SET_OUTPUT_SIZE(state, { width, height }) {
    state.outputWidth = width ?? state.outputWidth;
    state.outputHeight = height ?? state.outputHeight;
  },

  SET_FOLLOW_MODV_OUTPUT_SIZE(state, follow) {
    state.followModVOutputSize = follow;
  },

  SET_FOLLOW_MODV_FPS(state, follow) {
    state.followModVFps = follow;
  },

  SET_OUTPUT_TARGET_FPS(state, fps) {
    state.outputTargetFps = fps;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
