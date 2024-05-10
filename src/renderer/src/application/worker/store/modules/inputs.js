import { v4 as uuidv4 } from "uuid";
import { SWAP } from "./common/swap";

/**
 * InputLinkType enum string values.
 * @enum {String}
 */
// eslint-disable-next-line
const InputLinkType = {
  getter: "getter",
  mutation: "mutation",
  state: "state",
};

/**
 * @typedef {Object} InputLink
 *
 * @property {String}  inputId             The ID of the @Input to link to
 *
 * @property {InputLinkType}  type         The type of the @InputLink
 *
 * @property {String}  source              Identifies what created and/or manages this input link
 *
 * @property {Number}  [min]               Minimum expected value, will scale the incoming value to
 *                                         the input's min/max if min and max are set
 *
 * @property {Number}  [max]               Maximum expected value, will scale the incoming value to
 *                                         the input's min/max if min and max are set
 */

/**
 * @typedef {Object} InputLinkGetterType
 *
 * @property {String} location             location of the getter in the store, e.g. meyda/getFeature
 *
 * @property {Array}  [args]               arguments for a getter that is a function, e.g. ["energy"]
 *
 *
 * ⚠️ updates every frame
 * Reads a getter in the store, possibly with arguments, defined in ?args, and applies that to the
 * input link defined with inputId
 * @typedef {InputLink & InputLinkGetterType} InputLinkGetter
 */

/**
 * @typedef {Object} InputLinkMutationType
 *
 * @property {String} location             location of the value to read in the store, e.g.
 *                                         midi.devices[1].channelData[1][144]
 *
 * @property {Object} match                parameters of the mutation to match
 *
 * @property {String} match.type           Mutation type from the store, e.g. midi/WRITE_DATA
 *
 * @property {String} [match.payload]      Key-value pairs to match in the mutation payload, e.g.
 *                                         {
                                             id: `${id}-${name}-${manufacturer}`,
                                             channel: 1,
                                             type: 144,
                                           }
 *
 * Waits for a mutation type, defined with match.type, possibly checks the mutation payload for
 * specific unique parameters, defined on match.?payload, and applies a store value, specified
 * with location, to the input link defined with inputId
 * @typedef {InputLink & InputLinkMutationType} InputLinkMutation
 */

/**
 * @typedef {Object} InputLinkStateType
 *
 * @property {String} location             location of the getter in the store, e.g.
 *                                         midi.devices[1].channelData[1][144]
 *
 * ⚠️ updates every frame
 * Reads a location in the store and applies that to the input link defined with inputId
 * @typedef {InputLink & InputLinkStateType} InputLinkState
 */

function getDefaultState() {
  return {
    focusedInput: { id: null, title: null },
    inputs: {},
    inputLinks: {},
  };
}

const state = getDefaultState();
const swap = getDefaultState();

const getters = {
  inputsByActiveModuleId: (state) => (moduleId) =>
    Object.values(state.inputs).filter(
      (input) => input.data.moduleId === moduleId,
    ),
};

const actions = {
  setFocusedInput({ commit }, { id, title, writeToSwap }) {
    commit("SET_FOCUSED_INPUT", { id, title, writeToSwap });
  },

  clearFocusedInput({ commit }) {
    commit("SET_FOCUSED_INPUT", { id: null, title: null });
  },

  addInput(
    { commit },
    { type, getLocation, location, data, id = uuidv4(), writeToSwap },
  ) {
    const input = { type, getLocation, location, data, id };
    commit("ADD_INPUT", { input, writeToSwap });
    return input;
  },

  removeInput({ commit }, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (!writeTo.inputs[inputId]) {
      console.warn(
        "Did not remove input. Could not find input with id",
        inputId,
      );

      return false;
    }

    commit("REMOVE_INPUT", { inputId, writeToSwap });
    return true;
  },

  createInputLink(
    { commit },
    {
      inputId,
      location,
      type = "state",
      args,
      min = 0,
      max = 1,
      source,
      match,
      writeToSwap,
    },
  ) {
    const writeTo = writeToSwap ? swap : state;

    if (!source) {
      console.warn("Did not create inputLink. Require source", inputId);

      return false;
    }

    const inputLink = {
      id: inputId,
      location,
      type,
      args,
      min,
      max,
      source,
      match,
    };
    if (!writeTo.inputs[inputId]) {
      console.warn(
        "Did not create inputLink. Could not find input with id",
        inputId,
      );

      return false;
    }

    commit("ADD_INPUT_LINK", { inputLink, writeToSwap });
    return true;
  },

  updateInputLink({ commit }, { inputId, key, value, writeToSwap }) {
    commit("UPDATE_INPUT_LINK", { inputId, key, value, writeToSwap });
  },

  removeInputLink({ commit }, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (!writeTo.inputs[inputId]) {
      return false;
    }

    commit("REMOVE_INPUT_LINK", { inputId, writeToSwap });
    return true;
  },

  createPresetData() {
    return state;
  },

  async loadPresetData({ dispatch }, data) {
    await dispatch("setFocusedInput", data.focusedInput);

    const inputs = Object.values(data.inputs);
    for (let i = 0, len = inputs.length; i < len; i++) {
      const input = inputs[i];

      await dispatch("addInput", { ...input, writeToSwap: true });
    }

    const inputLinks = Object.values(data.inputLinks);

    for (let i = 0, len = inputLinks.length; i < len; i++) {
      const link = inputLinks[i];

      await dispatch("createInputLink", {
        inputId: link.id,
        ...link,
        writeToSwap: true,
      });
    }
  },
};

const mutations = {
  SET_FOCUSED_INPUT(state, { id, title, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    writeTo.focusedInput.id = id;
    writeTo.focusedInput.title = title;
  },

  ADD_INPUT(state, { input, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    writeTo.inputs[input.id] = input;
  },

  REMOVE_INPUT(state, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    delete writeTo.inputs[inputId];
  },

  ADD_INPUT_LINK(state, { inputLink, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    writeTo.inputLinks[inputLink.id] = inputLink;
  },

  UPDATE_INPUT_LINK(state, { inputId, key, value, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (!writeTo.inputLinks[inputId]) {
      return;
    }

    writeTo.inputLinks[inputId][key] = value;
  },

  REMOVE_INPUT_LINK(state, { inputId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    delete writeTo.inputLinks[inputId];
  },

  SWAP: SWAP(swap, getDefaultState),
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
