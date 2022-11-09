import SWAP from "./common/swap";
import store from "../";
import constants, { GROUP_DISABLED } from "../../../constants";
import uuidv4 from "uuid/v4";
import { applyExpression } from "../../../utils/apply-expression";

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
 * @property {Number}  enabled             Indicates whether the Group should be drawn. 0: not drawn,
 *                                         1: drawn, 2: not drawn to output canvas
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

function getDefaultState() {
  return { groups: [] };
}

const state = getDefaultState();
const swap = getDefaultState();

// Any keys marked false or arrays with keys given
// will not be moved from the base state when swapped
const sharedPropertyRestrictions = {
  groups: (
    // As state.groups is an Array, we return a function which checks the item in the Array,
    // returns a boolean. True to remove, false to keep.
    // Objects return an Array of keys to remove.
    // This keeps gallery group in place
    group
  ) => group.name === constants.GALLERY_GROUP_NAME
};

const getters = {
  groupIndexRenderOrder: state => {
    const galleryGroupIndex = state.groups.findIndex(
      group => group.name === constants.GALLERY_GROUP_NAME
    );
    const indexes = [...state.groups.keys()];

    if (galleryGroupIndex > -1) {
      indexes.splice(galleryGroupIndex, 1);
      indexes.push(galleryGroupIndex);
    }

    return indexes;
  }
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
      clearing: args.clearing ?? false,
      enabled: Number(args.enabled) ?? GROUP_DISABLED,
      hidden: args.hidden ?? false,
      modules: args.modules ?? [],
      inherit,
      inheritFrom: args.inheritFrom ?? -1,
      alpha: args.alpha ?? 1,
      pipeline: args.pipeline ?? 0,
      compositeOperation: args.compositeOperation || "normal",
      context: await store.dispatch("outputs/getAuxillaryOutput", {
        name,
        group: "group",
        id
      })
    };

    const inputs = [
      "alpha",
      "enabled",
      "clearing",
      "inherit",
      "compositeOperation",
      "pipeline"
    ];
    for (let i = 0; i < inputs.length; i += 1) {
      const inputName = inputs[i];
      const idKey = `${inputName}InputId`;

      if (args[idKey] !== undefined) {
        group[idKey] = args[idKey];
      } else {
        group[idKey] = (
          await store.dispatch("inputs/addInput", {
            type: "commit",
            location: "groups/UPDATE_GROUP_BY_KEY",
            data: { groupId: group.id, key: inputName }
          })
        ).id;
      }
    }

    commit("ADD_GROUP", { group, writeToSwap: args.writeToSwap });

    return group;
  },

  async removeGroup({ commit }, { groupId, writeToSwap }) {
    const group = state.groups.find(group => group.id === groupId);

    const inputIds = [
      group.alphaInputId,
      group.enabledInputId,
      group.clearingInputId,
      group.inheritInputId,
      group.compositeOperationInputId,
      group.pipelineInputId
    ];

    for (let i = 0; i < inputIds.length; i += 1) {
      const inputId = inputIds[i];

      await store.dispatch("inputs/removeInput", {
        inputId
      });
    }

    for (let i = 0; i < group.modules.length; i += 1) {
      const moduleId = group.modules[i];

      await store.dispatch("modules/removeActiveModule", { moduleId });
    }

    commit("REMOVE_GROUP", { id: groupId, writeToSwap });
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
  },

  updateGroupInput({ commit }, { groupId, key, data, writeToSwap }) {
    let dataOut = data;

    const group = state.groups.find(group => group.id === groupId);
    const inputId = group[`${key}InputId`];
    dataOut = applyExpression({ inputId, value: dataOut });

    commit("UPDATE_GROUP_BY_KEY", { groupId, key, data: dataOut, writeToSwap });
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

    const oldGroups = writeTo.groups.splice(0);

    const groupsLength = groups.length;
    let hasWrittenGalleryId = false;
    for (let i = 0; i < groupsLength; i += 1) {
      writeTo.groups.push(groups[i]);
      if (groups[i].name === constants.GALLERY_GROUP_NAME) {
        hasWrittenGalleryId = true;
      }
    }

    if (!hasWrittenGalleryId) {
      writeTo.groups.push(
        oldGroups.find(group => group.name === constants.GALLERY_GROUP_NAME)
      );
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

  SWAP: SWAP(swap, getDefaultState, sharedPropertyRestrictions)
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
