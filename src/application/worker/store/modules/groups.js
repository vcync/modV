import SWAP from "./common/swap";
import store from "../";
import uuidv4 from "uuid/v4";

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

const state = { groups: [] };
const swap = { groups: [] };
const temp = { groups: [] };

// Any keys marked false or arrays with keys given
// will not be moved from the base state when swapped
const sharedPropertyRestrictions = {
  groups: (
    // keeps gallery group in place
    value
  ) => [
    `${value.findIndex(group => group.name === "modV internal Gallery Group")}`
  ]
};

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
      context: await store.dispatch("outputs/getAuxillaryOutput", {
        name,
        group: "group"
      }),
      id: args.id || uuidv4()
    };

    commit("ADD_GROUP", { group, writeToSwap: args.writeToSwap });

    return group;
  },

  createPresetData() {
    return state.groups
      .filter(group => group.name !== "modV internal Gallery Group")
      .map(group => {
        const clonedGroup = { ...group };
        delete clonedGroup.context;
        return clonedGroup;
      });
  },

  async loadPresetData({ dispatch }, groups) {
    for (let i = 0, len = groups.length; i < len; i++) {
      const group = groups[i];
      await dispatch("createGroup", { ...group, writeToSwap: true });
    }

    return;
  }
};

const mutations = {
  ADD_GROUP(state, { group, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    writeTo.groups.push(group);
  },

  REMOVE_GROUP(state, { id, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.groups.findIndex(group => group.id === id);

    if (index > -1) {
      writeTo.groups.splice(index, 1);
    }
  },

  REPLACE_GROUPS(state, { groups, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    writeTo.groups.splice(0);
    const groupsLength = groups.length;
    for (let i = 0; i < groupsLength; i += 1) {
      writeTo.groups.push(groups[i]);
    }
  },

  REPLACE_GROUP_MODULES(state, { groupId, modules, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.groups.findIndex(group => group.id === groupId);

    if (index > -1) {
      writeTo.groups[index].modules = modules;
    }
  },

  ADD_MODULE_TO_GROUP(state, { moduleId, groupId, position, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const groupIndex = writeTo.groups.findIndex(group => group.id === groupId);

    if (groupIndex < 0) {
      return false;
    }

    const positionActual =
      typeof position === "undefined"
        ? writeTo.groups[groupIndex].modules.length
        : position;
    writeTo.groups[groupIndex].modules.splice(positionActual, 0, moduleId);
  },

  REMOVE_MODULE_FROM_GROUP(state, { moduleId, groupId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const groupIndex = writeTo.groups.findIndex(group => group.id === groupId);
    const moduleIndex = writeTo.groups[groupIndex].modules.findIndex(
      module => module === moduleId
    );

    if (groupIndex < 0 || moduleIndex < 0) {
      return false;
    }

    writeTo.groups[groupIndex].modules.splice(moduleIndex, 1);
  },

  UPDATE_GROUP(state, { groupId, data, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.groups.findIndex(group => group.id === groupId);

    if (index > -1) {
      const dataKeys = Object.keys(data);
      const dataKeysLength = dataKeys.length;
      for (let i = 0; i < dataKeysLength; i += 1) {
        const key = dataKeys[i];
        const value = data[key];
        writeTo.groups[index][key] = value;
      }
    }
  },

  SWAP: SWAP(swap, temp, () => ({ groups: [] }), sharedPropertyRestrictions)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
