import SWAP from "./common/swap";
import store from "../";
const uuidv4 = require("uuid/v4");

/**
 * @typedef {Object} Group
 *
 * @property {String}  id                  UUID of the Group
 *
 * @property {String}  name                Name of the Group
 *
 * @property {Boolean} hidden              Indicated whether this group is hidden or not
 *
 * @property {Array}   modules             The draw order of the Modules contained within the Group
 *
 * @property {Boolean} enabled             Indicates whether the Group should be drawn
 *
 * @property {Number}  alpha               The level of opacity, between 0 and 1, the Group should
 *                                         be drawn at
 *
 * @property {Boolean} inherit             Indicates whether the Group should inherit from another
 *                                         Group at redraw
 *
 * @property {Number}  inheritFrom         The target Group to inherit from, -1 being the previous
 *                                         Group in modV#Groups, 0-n being the index of
 *                                         another Group within modV#Groups
 *
 * @property {Boolean} pipeline            Indicates whether the Group should render using pipeline
 *                                         at redraw
 *
 * @property {Boolean} clearing            Indicates whether the Group should clear before redraw
 *
 * @property {String}  compositeOperation  The {@link Blendmode} the Group muxes with
 *
 * @property {Boolean} drawToOutput        Indicates whether the Group should draw to the output
 *                                         canvas
 *
 * @property {String}  drawToCanvasId      The ID of the auxillary Canvas to draw the Group to,
 *                                         null indicates the Group should draw to the main output
 *
 * @example
 * const Group = {
 *   name: 'Group',
 *
 *   position: 0,
 *
 *   modules: [
 *     'uuid1',
 *     'uuid2',
 *   ],
 *
 *   enabled: true,
 *
 *   alpha: 1,
 *
 *   inherit: true,
 *
 *   inheritFrom: -1,
 *
 *   pipeline: false,
 *
 *   clearing: false,
 *
 *   compositeOperation: 'normal',
 *
 *   drawToCanvasId: null,
 * };
 */

const state = [];
const swap = [];
const temp = [];

const actions = {
  async createGroup({ commit }, args = {}) {
    const name = args.name || "New Group";

    const group = {
      ...args,
      name,
      clearing: args.clearing || false,
      enabled: args.enabled || false,
      hidden: args.hidden || false,
      modules: args.modules || [],
      inherit: args.inherit || -1,
      alpha: args.alpha || 1,
      compositeOperation: args.compositeOperation || "normal",
      context: await store.dispatch("outputs/getAuxillaryOutput", { name })
    };

    group.id = uuidv4();
    commit("ADD_GROUP", group, args.writeToSwap);

    return group;
  }
};

const mutations = {
  ADD_GROUP(state, group, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    writeTo.push(group);
  },

  REMOVE_GROUP(state, id, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.findIndex(group => group.id === id);

    if (index > -1) {
      writeTo.splice(index, 1);
    }
  },

  REPLACE_GROUPS(state, groups, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;

    writeTo.splice(0);
    const groupsLength = groups.length;
    for (let i = 0; i < groupsLength; i += 1) {
      writeTo.push(groups[i]);
    }
  },

  REPLACE_GROUP_MODULES(state, { groupId, modules }, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.findIndex(group => group.id === groupId);

    if (index > -1) {
      writeTo[index].modules = modules;
    }
  },

  ADD_MODULE_TO_GROUP(state, { moduleId, groupId, position }, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    const groupIndex = writeTo.findIndex(group => group.id === groupId);

    const positionActual =
      typeof position === "undefined"
        ? writeTo[groupIndex].modules.length
        : position;
    writeTo[groupIndex].modules.splice(positionActual, 0, moduleId);
  },

  UPDATE_GROUP(state, { groupId, data }, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.findIndex(group => group.id === groupId);

    if (index > -1) {
      const dataKeys = Object.keys(data);
      const dataKeysLength = dataKeys.length;
      for (let i = 0; i < dataKeysLength; i += 1) {
        const key = dataKeys[i];
        const value = data[key];
        writeTo[index][key] = value;
      }
    }
  },

  SWAP: SWAP(swap, temp)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
