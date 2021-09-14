import SWAP from "./common/swap";
import store from "../";
import constants from "../../../constants";
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
 * @property {String|Number}  inheritFrom  The target Group to inherit from, -1 being the previous
 *                                         Group in modV#Groups, UUID4 string being the ID of
 *                                         another Group within modV.store.state.groups.groups
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
 * @property {String}  alphaInputId        The Input ID for the Alpha control
 *
 * @property {String}  enabledInputId      The Input ID for the Enabled control
 *
 * @property {String}  clearingInputId     The Input ID for the Clearing control
 *
 * @property {String}  inheritInputId      The Input ID for the Inherit control
 *
 * @property {String}  compositeOperationInputId  The Input ID for the Composite Operation control
 *
 * @property {String}  pipelineInputId     The Input ID for the Pipeline control
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

// Any keys marked false or arrays with keys given
// will not be moved from the base state when swapped
const sharedPropertyRestrictions = {
  groups: (
    // As state.groups is an Array, we return a function which checks the item in the Array,
    // returns a boolean. True to remove, false to keep.
    // Objects return an Array of keys to remove.
    // This keeps gallery group in place
    group
  ) => () => group.name !== constants.GALLERY_GROUP_NAME
};

const actions = {
  async createGroup({ commit }, args = {}) {
    const name = args.name || "New Group";
    const writeTo = args.writeToSwap ? swap : state;
    const inherit = args.inherit === undefined ? true : args.inherit;

    const existingGroupIndex = writeTo.groups.findIndex(
      group => group.id === args.id
    );

    if (existingGroupIndex > -1) {
      return writeTo.groups[existingGroupIndex];
    }

    const id = args.id || uuidv4();

    const group = {
      ...args,
      name,
      id,
      clearing: args.clearing || false,
      enabled: args.enabled || false,
      hidden: args.hidden || false,
      modules: args.modules || [],
      inherit,
      inheritFrom: args.inheritFrom || -1,
      alpha: args.alpha || 1,
      compositeOperation: args.compositeOperation || "normal",
      context: await store.dispatch("outputs/getAuxillaryOutput", {
        name,
        group: "group",
        id
      })
    };

    const alphaInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "alpha" }
    });
    group.alphaInputId = alphaInputBind.id;

    const enabledInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "enabled" }
    });
    group.enabledInputId = enabledInputBind.id;

    const clearingInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "clearing" }
    });
    group.clearingInputId = clearingInputBind.id;

    const inheritInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "inherit" }
    });
    group.inheritInputId = inheritInputBind.id;

    const coInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "compositeOperation" }
    });
    group.compositeOperationInputId = coInputBind.id;

    const pipelineInputBind = await store.dispatch("inputs/addInput", {
      type: "commit",
      location: "groups/UPDATE_GROUP_BY_KEY",
      data: { groupId: group.id, key: "pipeline" }
    });
    group.pipelineInputId = pipelineInputBind.id;

    commit("ADD_GROUP", { group, writeToSwap: args.writeToSwap });

    return group;
  },

  orderByIds({ commit }, { ids }) {
    const newGroups = ids.map(id => {
      return state.groups.find(group => group.id === id);
    });

    commit("REPLACE_GROUPS", { groups: newGroups });
  },

  createPresetData() {
    return state.groups
      .filter(group => group.name !== constants.GALLERY_GROUP_NAME)
      .map(group => {
        const clonedGroup = { ...group };
        delete clonedGroup.context;
        return clonedGroup;
      });
  },

  updateGroupName({ commit }, { groupId, name }) {
    const group = state.groups.find(group => group.id === groupId);

    store.commit("outputs/UPDATE_AUXILLARY", {
      auxillaryId: group.context.id,
      data: {
        name
      }
    });

    commit("UPDATE_GROUP", {
      groupId,
      data: {
        name
      }
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

  UPDATE_GROUP_BY_KEY(state, { groupId, key, data, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    const index = writeTo.groups.findIndex(group => group.id === groupId);

    if (index > -1) {
      writeTo.groups[index][key] = data;
    }
  },

  SWAP: SWAP(swap, () => ({ groups: [] }), sharedPropertyRestrictions)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
