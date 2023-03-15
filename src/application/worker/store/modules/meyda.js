import {
  getFeature,
  addSmoothingId,
  removeSmoothingId,
  getSmoothedFeature,
  MAX_SMOOTHING,
  SMOOTHING_STEP
} from "../../audio-features";
import { v4 as uuidv4 } from "uuid";

const state = {
  features: [
    "buffer",
    "complexSpectrum",
    "rms",
    "zcr",
    "energy",
    "spectralCentroid",
    "spectralFlatness",
    "spectralSlope",
    "spectralRolloff",
    "spectralSpread",
    "spectralSkewness",
    "spectralKurtosis",
    "perceptualSpread",
    "perceptualSharpness"
  ],
  smoothingIds: [],
  MAX_SMOOTHING,
  SMOOTHING_STEP
};

const getters = {
  getFeature: () => (feature, smoothingId, smoothingValue) => {
    if (smoothingId && smoothingValue) {
      return getSmoothedFeature(feature, smoothingId, smoothingValue);
    }

    return getFeature(feature);
  }
};

const actions = {
  addFeature({ commit }, feature) {
    commit("ADD_FEATURE", feature);
  },

  getSmoothingId() {
    const id = uuidv4();
    addSmoothingId(id);
    return id;
  },

  // eslint-disable-next-line no-empty-pattern
  removeSmoothingId({}, id) {
    removeSmoothingId(id);
  }
};

const mutations = {
  ADD_FEATURE(state, feature) {
    const index = state.features.indexOf(feature);

    if (index < 0) {
      state.features.push(feature);
    }
  },

  REMOVE_FEATURE(state, feature) {
    const index = state.features.indexOf(feature);

    if (index > -1) {
      state.features.splice(index, 1);
    }
  },

  ADD_SMOOTHING_ID(state, id) {
    state.smoothingIds.push(id);
  },

  REMOVE_SMOOTHING_ID(state, id) {
    const index = state.smoothingIds.indexOf(id);

    if (index > -1) {
      state.smoothingIds.splice(index, 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
