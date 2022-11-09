import Vue from "vue";
import SWAP from "./common/swap";
import getNextName from "../../../utils/get-next-name";
import getPropDefault from "../../../utils/get-prop-default";
import store from "..";
import get from "lodash.get";
import set from "lodash.set";

import uuidv4 from "uuid/v4";
import { applyExpression } from "../../../utils/apply-expression";

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

function getDefaultState() {
  return {
    registered: {},
    active: {},
    propQueue: {},
    metaQueue: {}
  };
}

const state = getDefaultState();
const swap = getDefaultState();

// this function either creates module properties from an existing module
// (e.g. loading a preset) or initialises the default value
async function initialiseModuleProperties(
  props,
  module,
  isGallery = false,
  useExistingData = false,
  existingData = {},
  writeToSwap = false
) {
  const propKeys = Object.keys(props);
  const propsWithoutId = [];

  if (useExistingData) {
    for (let i = 0, len = propKeys.length; i < len; i += 1) {
      const prop = propKeys[i];
      const propDidExist = !!existingData.$props[prop];

      if (propDidExist) {
        module.$props[prop].id = existingData.$props[prop].id;
      } else {
        propsWithoutId.push(prop);
      }
    }
  }

  for (let i = 0, len = propKeys.length; i < len; i++) {
    const propKey = propKeys[i];

    const prop = props[propKey];

    module.props[propKey] = await getPropDefault(
      module,
      propKey,
      prop,
      useExistingData
    );

    if (
      (!isGallery && !useExistingData) ||
      (propsWithoutId.length && propsWithoutId.indexOf(propKey) > -1)
    ) {
      const inputBind = await store.dispatch("inputs/addInput", {
        type: "action",
        location: "modules/updateProp",
        data: { moduleId: module.$id, prop: propKey },
        writeToSwap
      });

      if (
        prop.type in store.state.dataTypes &&
        store.state.dataTypes[prop.type].inputs
      ) {
        console.log(propKey);
        const dataTypeInputs = store.state.dataTypes[prop.type].inputs();
        const dataTypeInputsKeys = Object.keys(dataTypeInputs);

        for (let i = 0; i < dataTypeInputsKeys.length; i += 1) {
          const key = dataTypeInputsKeys[i];
          await store.dispatch("inputs/addInput", {
            type: "action",
            location: "modules/updateProp",
            data: {
              moduleId: module.$id,
              prop: propKey,
              path: `[${key}]`
            },
            id: `${inputBind.id}-${key}`,
            writeToSwap
          });
        }
      }

      module.$props[propKey].id = inputBind.id;
    }
  }

  return module;
}

const actions = {
  async registerModule(
    { commit, rootState },
    { module: moduleDefinition, hot = false }
  ) {
    const { renderers } = rootState;

    if (!moduleDefinition) {
      console.error("No module to register.");
      return;
    }

    if (!moduleDefinition.meta) {
      console.error("Malformed module.");
      return;
    }

    const { name, type } = moduleDefinition.meta;

    const existingModuleWithDuplicateName = Object.values(
      state.registered
    ).findIndex(registeredModule => registeredModule.meta.name === name);

    if (!hot && existingModuleWithDuplicateName > -1) {
      console.error(`Module registered with name "${name}" already exists.`);
      return;
    }

    if (renderers[type].setupModule) {
      try {
        moduleDefinition = await renderers[type].setupModule(moduleDefinition);
      } catch (e) {
        console.error(
          `Error in ${type} renderer setup whilst registering "${name}". This module was ommited from registration. \n\n${e}`
        );

        return false;
      }
    }

    commit("ADD_REGISTERED_MODULE", { module: moduleDefinition });

    if (hot) {
      const activeModuleValues = Object.values(state.active).filter(
        activeModule => activeModule.meta.name === name
      );

      for (let i = 0, len = activeModuleValues.length; i < len; i += 1) {
        const existingActiveModule = activeModuleValues[i];
        const activeModule = { ...existingActiveModule };

        const { canvas } = rootState.outputs.main || {
          canvas: { width: 0, height: 0 }
        };

        const { props } = moduleDefinition;

        activeModule.$props = JSON.parse(JSON.stringify(props));

        const initialisedModule = await initialiseModuleProperties(
          props,
          { ...activeModule },
          false,
          true,
          existingActiveModule
        );

        commit("ADD_ACTIVE_MODULE", { module: initialisedModule });

        if ("init" in moduleDefinition) {
          const { data } = activeModule;
          const returnedData = moduleDefinition.init({
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

    module.$props = JSON.parse(JSON.stringify(props));

    if (!existingModule) {
      module.$id = uuidv4();
      module.$moduleName = moduleName;
      module.props = {};

      await initialiseModuleProperties(props, module, moduleMeta.isGallery);

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
          type: "action",
          location: "modules/updateMeta",
          data: { id: module.$id, metaKey: "alpha" }
        });

        module.meta.alphaInputId = alphaInputBind.id;

        const enabledInputBind = await store.dispatch("inputs/addInput", {
          type: "action",
          location: "modules/updateMeta",
          data: { id: module.$id, metaKey: "enabled" }
        });

        module.meta.enabledInputId = enabledInputBind.id;

        const coInputBind = await store.dispatch("inputs/addInput", {
          type: "action",
          location: "modules/updateMeta",
          data: { moduleId: module.$id, metaKey: "compositeOperation" }
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
        true,
        existingModule,
        writeToSwap
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
      const { renderers } = rootState;
      if ("resizeModule" in renderers[module.meta.type]) {
        const { data, props } = module;
        let returnedData;

        try {
          returnedData = renderers[module.meta.type].resizeModule({
            moduleDefinition,
            canvas,
            data: { ...data },
            props
          });
        } catch (error) {
          console.error(
            `module#resize() in ${module.meta.name} threw an error: ${error}`
          );
        }

        if (returnedData) {
          commit("UPDATE_ACTIVE_MODULE", {
            id: module.$id,
            key: "data",
            value: returnedData,
            writeToSwap
          });
        }
      }
    }

    return module;
  },

  async updateProp(
    { state, commit },
    { moduleId, prop, data, group, path = "", groupName, writeToSwap }
  ) {
    if (!state.active[moduleId]) {
      console.error(`The module with the moduleId ${moduleId} doesn't exist.`);
      return;
    }

    const moduleName = state.active[moduleId].$moduleName;
    const inputId = state.active[moduleId].$props[prop].id;
    const propData = state.registered[moduleName].props[prop];
    const currentValue = get(
      state.active[moduleId][prop],
      path,
      state.active[moduleId][prop]
    );
    const { type } = propData;

    // if (group || groupName) {
    //   propData = state.active[name].props[groupName].props[prop];
    // }

    if (data === currentValue) {
      return;
    }

    let dataOut = data;

    dataOut = applyExpression({ inputId, value: dataOut });

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
        type: propData.type,
        path
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

  async updateMeta({ commit }, { id: moduleId, metaKey, data, writeToSwap }) {
    if (!state.active[moduleId]) {
      console.error(`The module with the moduleId ${moduleId} doesn't exist.`);
      return;
    }

    const currentValue = state.active[moduleId].meta[metaKey];
    const inputId = state.active[moduleId].meta[`${metaKey}InputId`];

    if (data === currentValue) {
      return;
    }

    let dataOut = data;

    dataOut = applyExpression({ inputId, value: dataOut });

    commit("UPDATE_ACTIVE_MODULE_META", {
      id: moduleId,
      metaKey,
      data: dataOut,
      writeToSwap
    });
  },

  resize({ commit, state, rootState }, { moduleId, width, height }) {
    const module = state.active[moduleId];
    const moduleName = module.$moduleName;
    const moduleDefinition = state.registered[moduleName];
    const { renderers } = rootState;

    if (
      "resize" in moduleDefinition &&
      "resizeModule" in renderers[module.meta.type]
    ) {
      const { data, props } = module;
      let returnedData;

      try {
        returnedData = renderers[module.meta.type].resizeModule({
          moduleDefinition,
          canvas: { width, height },
          data: { ...data },
          props
        });
      } catch (error) {
        console.error(
          `module#resize() in ${module.meta.name} threw an error: ${error}`
        );
      }

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

  createPresetData({ rootState }) {
    const { renderers } = rootState;

    return Object.values(state.active)
      .filter(module => !module.meta.isGallery)
      .reduce((obj, module) => {
        const {
          meta: { type },
          data
        } = module;

        obj[module.$id] = { ...module };
        delete obj[module.$id].$status;

        if (renderers[type].createPresetData) {
          module.data = {
            ...data,
            ...renderers[type].createPresetData(module)
          };
        }

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

  async removeActiveModule({ commit, rootState }, { moduleId, writeToSwap }) {
    const writeTo = writeToSwap ? swap : state;

    const module = writeTo.active[moduleId];
    const {
      meta,
      meta: { type }
    } = module;

    if (!module) {
      throw new Error(`No module with id "${moduleId}" found`);
    }

    const { renderers } = rootState;
    if (renderers[type].removeActiveModule) {
      renderers[type].removeActiveModule(module);
    }

    const metaInputIds = [
      meta.alphaInputId,
      meta.compositeOperationInputId,
      meta.enabledInputId
    ];
    const moduleProperties = Object.values(module.$props).map(prop => ({
      id: prop.id,
      type: prop.type
    }));
    const inputIds = [...moduleProperties, ...metaInputIds.map(id => ({ id }))];

    for (let i = 0, len = inputIds.length; i < len; i++) {
      const { id: inputId, type: propType } = inputIds[i];

      await store.dispatch("inputs/removeInputLink", {
        inputId,
        writeToSwap
      });

      await store.dispatch("inputs/removeInput", {
        inputId
      });

      // clear up datatypes with multiple inputs
      if (
        propType in store.state.dataTypes &&
        store.state.dataTypes[propType].inputs
      ) {
        const dataTypeInputs = store.state.dataTypes[propType].inputs();
        const dataTypeInputsKeys = Object.keys(dataTypeInputs);

        for (let j = 0; j < dataTypeInputsKeys.length; j += 1) {
          const key = dataTypeInputsKeys[j];
          await store.dispatch("inputs/removeInputLink", {
            inputId: `${inputId}-${key}`,
            writeToSwap
          });

          await store.dispatch("inputs/removeInput", {
            inputId: `${inputId}-${key}`
          });
        }
      }
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
    { moduleId, prop, data, data: { path }, group, groupName, writeToSwap }
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
    } else if (path) {
      const tempValue = writeTo.active[moduleId].props[prop];
      set(tempValue, path, value);
      if (Array.isArray(tempValue)) {
        Vue.set(writeTo.active[moduleId].props, prop, [...tempValue]);
      } else {
        Vue.set(writeTo.active[moduleId].props, prop, tempValue);
      }
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

  SWAP: SWAP(swap, getDefaultState, sharedPropertyRestrictions)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
