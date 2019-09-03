import Vue from "vue";
import cloneDeep from "lodash.clonedeep";
import SWAP from "./common/swap";
import getNextName from "../../../utils/get-next-name";
import getPropDefault from "../../../utils/get-prop-default";
import store from "..";

const uuidv4 = require("uuid/v4");

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

const temp = {};

const actions = {
  registerModule({ commit }, module) {
    if (!module) {
      console.error("No module to register");
      return;
    }

    if (!module.meta) {
      console.error("Malformed module.");
      return;
    }

    commit("ADD_REGISTERED_MODULE", module);
  },

  async makeActiveModule(
    { commit, rootState },
    { moduleName, moduleMeta = {}, writeToSwap }
  ) {
    const { renderers } = rootState;
    let module = cloneDeep(state.registered[moduleName]);

    if (renderers[module.meta.type].setupModule) {
      try {
        module = await renderers[module.meta.type].setupModule(module);
      } catch (e) {
        console.error(
          `Error in ${
            module.meta.type
          } renderer setup whilst activating ${moduleName}. This module was ommited from activation.`
        );
        return false;
      }
    }

    module.meta.originalName = module.meta.name;
    module.meta.name =
      moduleMeta.name ||
      (await getNextName(`${module.meta.name}`, Object.keys(state.active)));
    module.meta.alpha = 1;
    module.meta.enabled = false;
    module.meta.compositeOperation = "normal";

    const { data, props, presets } = module;

    if (data) {
      const dataKeys = Object.keys(data);
      for (let i = 0, len = dataKeys.length; i < len; i++) {
        const key = dataKeys[i];

        const value = data[key];
        module[key] = value;
      }
    }

    if (props) {
      const propKeys = Object.keys(props);
      for (let i = 0, len = propKeys.length; i < len; i++) {
        const key = propKeys[i];

        const value = props[key];

        module[key] = await getPropDefault(module, key, value);

        if (value.type === "group") {
          module[key] = {};

          module[key].length = value.default > -1 ? value.default : 1;
          module[key].props = {};

          const valuePropKeys = Object.keys(value.props);
          for (let j = 0, len = valuePropKeys.length; j < len; j++) {
            const groupProp = valuePropKeys[j];

            const groupValue = value.props[groupProp];
            module[key].props[groupProp] = [];

            if (value.default && typeof groupValue.default !== "undefined") {
              for (let i = 0; i < value.default; i += 1) {
                module[key].props[groupProp][i] = groupValue.default;
              }
            }
          }
        }

        if (value.control) {
          // if (value.control.type === "paletteControl") {
          //   const { options } = value.control;
          //   store.dispatch("palettes/createPalette", {
          //     id: `${meta.name}-${key}`,
          //     colors: options.colors || [],
          //     duration: options.duration,
          //     returnFormat: options.returnFormat,
          //     moduleName: meta.name,
          //     variable: key
          //   });
          // }
        }
      }
    }

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

    // We're done setting up the module, we can commit now
    module.id = uuidv4();
    commit("ADD_ACTIVE_MODULE", module, writeToSwap);

    if ("audioFeatures" in module.meta) {
      if (Array.isArray(module.meta.audioFeatures)) {
        const audioFeatueKeys = module.meta.audioFeatures;
        for (let i = 0, len = audioFeatueKeys.length; i < len; i++)
          store.dispatch("meyda/addFeature", audioFeatueKeys[i]);
      }
    }

    const { canvas } = rootState.outputs.main || {
      canvas: { width: 0, height: 0 }
    };

    if ("init" in module) {
      module.init({ canvas });
    }

    if ("resize" in module) {
      module.resize({ canvas });
    }

    return module;
  },

  async updateProp(
    { state, commit },
    { moduleId, prop, data, group, groupName, writeToSwap }
  ) {
    const propData = state.active[moduleId].props[prop];
    const currentValue = state.active[moduleId][prop];
    const { type } = propData;

    // if (group || groupName) {
    //   propData = state.active[name].props[groupName].props[prop];
    // }

    if (data === currentValue) return;

    let dataOut = data;

    // store.getters['plugins/enabledPlugins']
    //   .filter(plugin => 'processValue' in plugin.plugin)
    //   .forEach(plugin => {
    //     const newValue = plugin.plugin.processValue({
    //       currentValue: data,
    //       controlVariable: prop,
    //       delta: modV.delta,
    //       moduleName: name
    //     })

    //     if (typeof newValue !== 'undefined') dataOut = newValue
    //   })

    if (
      store.state["data-types"][type] &&
      store.state["data-types"][type].create
    ) {
      dataOut = await store.state["data-types"][type].create(dataOut);
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

    commit(
      "UPDATE_ACTIVE_MODULE_PROP",
      {
        moduleId,
        prop,
        data: {
          value: dataOut,
          type: propData.type
        },
        group,
        groupName
      },
      writeToSwap
    );

    if (group || groupName) {
      if ("set" in state.active[moduleId].props[groupName].props[prop]) {
        state.active[moduleId].props[groupName].props[prop].set.bind(
          state.active[moduleId]
        )(dataOut);
      }
    } else if ("set" in state.active[moduleId].props[prop]) {
      state.active[moduleId].props[prop].set.bind(state.active[moduleId])(
        dataOut
      );
    }
  },

  resize({ state }, { moduleId, width, height }) {
    const module = state.active[moduleId];
    if (module.resize) {
      module.resize({ canvas: { width, height } });
    }
  },

  init({ state }, { moduleId, width, height }) {
    const module = state.active[moduleId];
    if (module.init) {
      module.init({ canvas: { width, height } });
    }
  }
};

const mutations = {
  ADD_REGISTERED_MODULE(state, module, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.registered, module.meta.name, module);
  },

  REMOVE_REGISTERED_MODULE(state, moduleName, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    delete writeTo.registered[moduleName];
  },

  ADD_ACTIVE_MODULE(state, module, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.active, module.id, module);
  },

  REMOVE_ACTIVE_MODULE(state, moduleId, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    delete writeTo.active[moduleId];
  },

  async UPDATE_ACTIVE_MODULE_PROP(
    state,
    { moduleId, prop, data, group, groupName },
    writeToSwap
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
      Vue.set(writeTo.active[moduleId], prop, value);
    }
  },

  UPDATE_ACTIVE_MODULE_META(state, { id, metaKey, data }, writeToSwap) {
    const writeTo = writeToSwap ? swap : state;
    Vue.set(writeTo.active[id].meta, metaKey, data);
  },

  SWAP: SWAP(swap, temp)
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
