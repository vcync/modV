import Vue from "vue";
import SWAP from "./common/swap";
import getNextName from "../../../utils/get-next-name";
import getPropDefault from "../../../utils/get-prop-default";
import store from "..";

import uuidv4 from "uuid/v4";

// Any keys marked false or arrays with keys given
// will not be moved from the base state when swapped
const sharedPropertyRestrictions = {
  registered: false, // will not move
  active: (
    // keeps gallery item modules in place
    value
  ) =>
    Object.values(value)
      .filter(module => module.meta.isGallery)
      .map(module => module.$id),
  propQueue: true, // will move
  metaQueue: true // will move
};

const state = {
  registered: {},
  active: {},
  propQueue: {},
  metaQueue: {}
};

const swap = {
  registered: {},
  active: {},
  propQueue: {},
  metaQueue: {}
};

// this function either creates module properties from an existing module
// (e.g. loading a preset) or initialises the default value
async function initialiseModuleProperties(
  props,
  module,
  isGallery = false,
  useExistingData = false
) {
  const propKeys = Object.keys(props);

  for (let i = 0, len = propKeys.length; i < len; i++) {
    const propKey = propKeys[i];

    const prop = props[propKey];

    module.props[propKey] = await getPropDefault(
      module,
      propKey,
      prop,
      useExistingData
    );

    if (!isGallery && !useExistingData) {
      const inputBind = await store.dispatch("inputs/addInput", {
        type: "action",
        location: "modules/updateProp",
        data: { moduleId: module.$id, prop: propKey }
      });

      module.$props[propKey].id = inputBind.id;
    }
  }

  return module;
}

const actions = {
  async registerModule({ commit, rootState }, { module, hot = false }) {
    const { renderers } = rootState;

    if (!module) {
      console.error("No module to register.");
      return;
    }

    if (!module.meta) {
      console.error("Malformed module.");
      return;
    }

    const { name, type } = module.meta;

    const existingModuleWithDuplicateName = Object.values(
      state.registered
    ).findIndex(registeredModule => registeredModule.meta.name === name);

    if (!hot && existingModuleWithDuplicateName > -1) {
      console.error(`Module registered with name "${name}" already exists.`);
      return;
    }

    if (renderers[type].setupModule) {
      try {
        module = await renderers[type].setupModule(module);
      } catch (e) {
        console.error(
          `Error in ${type} renderer setup whilst registering "${name}". This module was ommited from registration. \n\n${e}`
        );

        return false;
      }
    }

    commit("ADD_REGISTERED_MODULE", { module });

    if (hot) {
      const activeModuleValues = Object.values(state.active);

      for (let i = 0; i < activeModuleValues.length; i += 1) {
        const activeModule = activeModuleValues[i];

        if (activeModule.meta.name === name) {
          const { canvas } = rootState.outputs.main || {
            canvas: { width: 0, height: 0 }
          };

          if ("init" in module) {
            const { data } = activeModule;
            const returnedData = module.init({
              canvas,
              data: { ...data },
              props: activeModule.props
            });

            if (returnedData) {
              commit("UPDATE_ACTIVE_MODULE", {
                id: activeModule.$id,
                key: "data",
                value: returnedData,
                writeToSwap: false
              });
            }
          }
        }
      }
    }
  },

  async makeActiveModule(
    { commit, rootState },
    { moduleName, moduleMeta = {}, existingModule, writeToSwap }
  ) {
    const writeTo = writeToSwap ? swap : state;
    const expectedModuleName = existingModule
      ? existingModule.$moduleName
      : moduleName;
    const moduleDefinition = state.registered[expectedModuleName];

    const { props = {}, data = {} } = moduleDefinition || {};

    let module = {};

    if (moduleDefinition) {
      module = {
        meta: { ...moduleDefinition.meta, ...moduleMeta },
        ...existingModule,
        $status: []
      };
    } else {
      module = {
        meta: { ...moduleMeta },
        ...existingModule,
        $status: []
      };

      console.error(
        `Could not find registered module with name ${expectedModuleName}.`
      );

      module.$status.push({
        type: "error",
        message: `Module "${expectedModuleName}" is not registered. modV will skip this while rendering`
      });
    }

    if (moduleMeta.isGallery) {
      const existingModuleWithDuplicateNameInGallery = Object.values(
        writeTo.active
      ).find(
        activeModule =>
          activeModule.meta.isGallery && activeModule.meta.name === moduleName
      );

      if (existingModuleWithDuplicateNameInGallery) {
        console.warn(
          `Module active in gallery with name "${moduleName}" already exists.`
        );
        return existingModuleWithDuplicateNameInGallery;
      }
    }

    if (!existingModule) {
      module.$id = uuidv4();
      module.$moduleName = moduleName;
      module.$props = JSON.parse(JSON.stringify(props));

      module.props = {};

      await initialiseModuleProperties(
        props,
        module,
        moduleMeta.isGallery,
        existingModule
      );

      const dataKeys = Object.keys(data);
      module.data = {};

      for (let i = 0, len = dataKeys.length; i < len; i++) {
        const dataKey = dataKeys[i];

        const datum = data[dataKey];
        module.data[dataKey] = datum;
      }

      module.meta.name = await getNextName(
        `${moduleName}`,
        Object.keys(state.active)
      );
      module.meta.alpha = 1;
      module.meta.enabled = false;
      module.meta.compositeOperation = "normal";

      if (!moduleMeta.isGallery) {
        const alphaInputBind = await store.dispatch("inputs/addInput", {
          type: "commit",
          location: "modules/UPDATE_ACTIVE_MODULE_META",
          data: { id: module.$id, metaKey: "alpha" }
        });

        module.meta.alphaInputId = alphaInputBind.id;

        const enabledInputBind = await store.dispatch("inputs/addInput", {
          type: "commit",
          location: "modules/UPDATE_ACTIVE_MODULE_META",
          data: { id: module.$id, metaKey: "enabled" }
        });

        module.meta.enabledInputId = enabledInputBind.id;

        const coInputBind = await store.dispatch("inputs/addInput", {
          type: "commit",
          location: "modules/UPDATE_ACTIVE_MODULE_META",
          data: { id: module.$id, metaKey: "compositeOperation" }
        });

        module.meta.compositeOperationInputId = coInputBind.id;
      }

      const { presets } = module;

      if (moduleMeta) {
        const moduleMetaKeys = Object.keys(moduleMeta);
        for (let i = 0, len = moduleMetaKeys.length; i < len; i++) {
          const key = moduleMetaKeys[i];

          const value = moduleMeta[key];

          module.meta[key] = value;
        }
      }

      if (presets) {
        module.presets = {};

        const presetKeys = Object.keys(presets);
        for (let i = 0, len = presetKeys.length; i < len; i++) {
          const key = presetKeys[i];

          const value = presets[key];
          module.presets[key] = value;
        }
      }
    } else {
      await initialiseModuleProperties(
        props,
        module,
        moduleMeta.isGallery,
        true
      );
    }

    // We're done setting up the module, we can commit now

    commit("ADD_ACTIVE_MODULE", { module, writeToSwap });

    if ("audioFeatures" in module.meta) {
      if (Array.isArray(module.meta.audioFeatures)) {
        const audioFeatureKeys = module.meta.audioFeatures;
        for (let i = 0, len = audioFeatureKeys.length; i < len; i++) {
          store.dispatch("meyda/addFeature", audioFeatureKeys[i]);
        }
      }
    }

    const { canvas } = rootState.outputs.main || {
      canvas: { width: 0, height: 0 }
    };

    if (moduleDefinition && "init" in moduleDefinition) {
      const { data } = writeTo.active[module.$id];
      const returnedData = moduleDefinition.init({
        canvas,
        data: { ...data },
        props: module.props
      });

      if (returnedData) {
        commit("UPDATE_ACTIVE_MODULE", {
          id: module.$id,
          key: "data",
          value: returnedData,
          writeToSwap
        });
      }
    }

    if (moduleDefinition && "resize" in moduleDefinition) {
      const { data } = writeTo.active[module.$id];
      const returnedData = moduleDefinition.resize({
        canvas,
        data: { ...data },
        props: module.props
      });
      if (returnedData) {
        commit("UPDATE_ACTIVE_MODULE", {
          id: module.$id,
          key: "data",
          value: returnedData,
          writeToSwap
        });
      }
    }

    return module;
  },

  async updateProp(
    { state, commit },
    { moduleId, prop, data, group, groupName, writeToSwap }
  ) {
    if (!state.active[moduleId]) {
      console.error(`The module with the moduleId ${moduleId} doesn't exist.`);
      return;
    }

    const moduleName = state.active[moduleId].$moduleName;
    const inputId = state.active[moduleId].$props[prop].id;
    const propData = state.registered[moduleName].props[prop];
    const currentValue = state.active[moduleId][prop];
    const { type } = propData;

    // if (group || groupName) {
    //   propData = state.active[name].props[groupName].props[prop];
    // }

    if (data === currentValue) {
      return;
    }

    let dataOut = data;

    const expressionAssignment = store.getters["expressions/getByInputId"](
      inputId
    );

    if (expressionAssignment) {
      const scope = {
        value: dataOut,
        time: Date.now()
      };

      dataOut = expressionAssignment.func.evaluate(scope);
    }

    if (store.state.dataTypes[type] && store.state.dataTypes[type].create) {
      dataOut = await store.state.dataTypes[type].create(dataOut);
    }

    if (!Array.isArray(dataOut)) {
      const { strict, min, max, abs } = propData;

      if (strict && typeof min !== "undefined" && typeof max !== "undefined") {
        dataOut = Math.min(Math.max(dataOut, min), max);
      }

      if (abs) {
        dataOut = Math.abs(dataOut);
      }

      if (type === "int") {
        dataOut = Math.round(dataOut);
      }
    }

    commit("UPDATE_ACTIVE_MODULE_PROP", {
      moduleId,
      prop,
      data: {
        value: dataOut,
        type: propData.type
      },
      group,
      groupName,

      writeToSwap
    });

    if (group || groupName) {
      if ("set" in state.registered[moduleName].props[groupName].props[prop]) {
        state.registered[moduleName].props[groupName].props[prop].set.bind(
          state.registered[moduleName]
        )({
          data: { ...state.active[moduleId].data },
          props: state.active[moduleId].props
        });
      }
    } else if ("set" in state.registered[moduleName].props[prop]) {
      state.registered[moduleName].props[prop].set.bind(
        state.registered[moduleName]
      )({
        data: { ...state.active[moduleId].data },
        props: state.active[moduleId].props
      });
    }
  },

  resize({ commit, state }, { moduleId, width, height }) {
    const module = state.active[moduleId];
    const moduleName = module.$moduleName;
    const moduleDefinition = state.registered[moduleName];

    if ("resize" in moduleDefinition) {
      const { data, props } = module;
      const returnedData = moduleDefinition.resize({
        canvas: { width, height },
        data: { ...data },
        props
      });

      if (returnedData) {
        commit("UPDATE_ACTIVE_MODULE", {
          id: moduleId,
          key: "data",
          value: returnedData
        });
      }
    }
  },

  init({ commit, state }, { moduleId, width, height }) {
    const module = state.active[moduleId];
    const moduleName = module.$moduleName;
    const moduleDefinition = state.registered[moduleName];

    if ("init" in moduleDefinition) {
      const { data, props } = module;
      const returnedData = moduleDefinition.init({
        canvas: { width, height },
        data: { ...data },
        props
      });

      if (returnedData) {
        commit("UPDATE_ACTIVE_MODULE", {
          id: moduleId,
          key: "data",
          value: returnedData
        });
      }
    }
  },

  createPresetData() {
    return Object.values(state.active)
      .filter(module => !module.meta.isGallery)
      .reduce((obj, module) => {
        obj[module.$id] = module;
        delete obj[module.$id].$status;

        return obj;
      }, {});
  },

  async loadPresetData({ dispatch }, modules) {
    const moduleValues = Object.values(modules);

    for (let i = 0, len = moduleValues.length; i < len; i++) {
      const module = moduleValues[i];

      await dispatch("makeActiveModule", {
        moduleName: module.$moduleName,
        existingModule: module,
        writeToSwap: true
      });
    }

    return;
  },

  async removeActiveModule({ commit }, { moduleId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    const module = writeTo.active[moduleId];
    const { meta } = module;

    if (!module) {
      throw new Error(`No module with id "${moduleId}" found`);
    }

    const metaInputIds = [
      meta.alphaInputId,
      meta.compositeOperationInputId,
      meta.enabledInputId
    ];
    const moduleProperties = Object.values(module.$props).map(prop => prop.id);
    const inputIds = [...moduleProperties, ...metaInputIds];

    for (let i = 0, len = inputIds.length; i < len; i++) {
      const inputId = inputIds[i];

      await store.dispatch("inputs/removeInputLink", {
        inputId,
        writeToSwap
      });
    }

    commit("REMOVE_ACTIVE_MODULE", { moduleId, writeToSwap });
  }
};

const mutations = {
  ADD_REGISTERED_MODULE(state, { module, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.registered, module.meta.name, module);
  },

  REMOVE_REGISTERED_MODULE(state, { moduleName, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    Vue.delete(writeTo.registered, moduleName);
  },

  ADD_ACTIVE_MODULE(state, { module, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.active, module.$id, module);
  },

  REMOVE_ACTIVE_MODULE(state, { moduleId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    delete writeTo.active[moduleId];
  },

  UPDATE_ACTIVE_MODULE(state, { id, key, value, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.active[id], key, value);
  },

  async UPDATE_ACTIVE_MODULE_PROP(
    state,
    { moduleId, prop, data, group, groupName, writeToSwap }
  ) {
    const writeTo = writeToSwap ? swap : state;
    const value = data.value;

    // if (data.type === "texture") {
    //   value = await textureResolve(data.value);
    // } else {
    //   value = data.value;
    // }

    if (typeof group === "number") {
      Vue.set(writeTo.active[moduleId][groupName].props[prop], group, value);
    } else {
      Vue.set(writeTo.active[moduleId].props, prop, value);
    }
  },

  UPDATE_ACTIVE_MODULE_META(state, { id, metaKey, data, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    if (id) {
      Vue.set(writeTo.active[id].meta, metaKey, data);
    }
  },

  SWAP: SWAP(swap, () => ({}), sharedPropertyRestrictions)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
