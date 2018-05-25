import Vue from 'vue';
import Ajv from 'ajv/lib/ajv';
import { modV } from '@/modv';
import store from '../index';

const jsd4 = require('ajv/lib/refs/json-schema-draft-04.json');

const makeSchema = function makeSchema(properties) {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties,
  };
};

const externalState = {
  active: {},
};

window.externalState = externalState;

const state = {
  active: {},
  registry: {},
  focusedModule: null,
  currentDragged: null,
};

function generateName(name) {
  let dupeNo = 1;

  if (name in state.active) {
    let dupeName = `${name} (${dupeNo})`;
    while (dupeName in state.active) {
      dupeNo += 1;
      dupeName = `${name} (${dupeNo})`;
    }
    return dupeName;
  }

  return name;
}

// getters
const getters = {
  registry: state => state.registry,
  activeModules: state => state.active,
  focusedModule: state => externalState.active[state.focusedModule],
  focusedModuleName: state => state.focusedModule,
  getActiveModule: () => moduleName => externalState.active[moduleName],
  currentDragged: state => state.currentDragged,
  getValueFromActiveModule: state => (moduleName, controlVariable) => {
    const module = externalState.active[moduleName];
    let processed = externalState.active[moduleName][controlVariable];

    if ('append' in module.info.controls[controlVariable]) {
      processed = processed.replace(module.info.controls[controlVariable].append, '');
    }

    return {
      raw: state.active[moduleName][controlVariable],
      processed,
    };
  },
};

// actions
const actions = {
  createActiveModule({ commit, state }, { moduleName, appendToName, skipInit, enabled }) {
    return new Promise((resolve) => {
      const module = new state.registry[moduleName]();
      let newModuleName = generateName(module.info.name);
      module.info.name = newModuleName;
      module.info.alpha = 1;
      module.info.originalName = moduleName;
      module.info.enabled = enabled || false;
      module.info.compositeOperation = 'normal';

      const dimensions = store.getters['size/dimensions'];
      const useDpr = store.getters['user/useRetina'];

      if (useDpr) {
        dimensions.width *= window.devicePixelRatio;
        dimensions.height *= window.devicePixelRatio;
      }

      const canvas = modV.bufferCanvas;

      if ('init' in module && !skipInit) module.init(canvas);

      if ('meyda' in module.info) {
        if (Array.isArray(module.info.meyda)) {
          module.info.meyda.forEach(feature =>
            store.commit('meyda/addFeature', { feature }),
          );
        }
      }

      newModuleName = `${newModuleName}${appendToName || ''}`;

      if ('controls' in module.info) {
        Object.keys(module.info.controls).forEach((key) => {
          const control = module.info.controls[key];
          const inputId = `${newModuleName}-${control.variable}`;

          if (control.type === 'paletteControl') {
            store.dispatch('palettes/createPalette', {
              id: inputId,
              colors: control.colors || [],
              duration: control.timePeriod,
              moduleName: newModuleName,
              variable: control.variable,
            });
          }
        });
      }

      commit('addActiveModule', { module, moduleName: newModuleName });
      resolve(module);
    });
  },
  removeActiveModule({ commit }, { moduleName }) {
    const Module = externalState.active[moduleName];

    store.commit('controlPanels/unpinPanel', { moduleName });

    if (state.focusedModule === moduleName) {
      commit('setModuleFocus', { activeModuleName: null });
    }

    if ('controls' in Module.info) {
      Object.keys(Module.info.controls).forEach((key) => {
        const control = Module.info.controls[key];
        const inputId = `${moduleName}-${control.variable}`;

        if (control.type === 'paletteControl') {
          store.dispatch('palettes/removePalette', {
            id: inputId,
          });
        }
      });
    }

    commit('removeActiveModule', { moduleName });
  },
  register({ commit }, { Module }) {
    const instantiated = new Module();
    const moduleName = instantiated.info.name;
    commit('addModuleToRegistry', { Module, moduleName });
  },
  resizeActive({ state }) {
    const canvas = modV.bufferCanvas;
    Object.keys(state.active).forEach((moduleName) => {
      let module;

      if (moduleName.indexOf('-gallery') > -1) return;

      if (moduleName in externalState.active) {
        module = externalState.active[moduleName];
      } else {
        return;
      }

      if ('resize' in module) {
        module.resize(canvas);
      }
    });
  },
  presetData({ state }) {
    // @TODO: figure out a better clone than JSONparse(JSONstringify())
    const ajv = new Ajv({
      removeAdditional: 'all',
    });
    ajv.addMetaSchema(jsd4);


    const moduleNames = Object.keys(state.active)
      .filter(key => key.substring(key.length - 8, key.length) !== '-gallery');

    const moduleData = moduleNames.reduce((obj, moduleName) => {
      obj[moduleName] = {};
      obj[moduleName].values = JSON.parse(JSON.stringify(state.active[moduleName]));
      return obj;
    }, {});

    moduleNames.forEach((moduleName) => {
      const Module = externalState.active[moduleName];

      const moduleInfo = {
        alpha: Module.info.alpha,
        author: Module.info.author,
        compositeOperation: Module.info.compositeOperation,
        enabled: Module.info.enabled,
        originalName: Module.info.originalName,
        version: Module.info.version,
      };

      // Merge Module data onto existing data
      moduleData[moduleName] = Object.assign(moduleData[moduleName], moduleInfo);
      delete moduleData[moduleName].values.info;

      if (!('saveData' in Module.info)) {
        console.warn(`generatePreset: Module ${Module.info.name} has no saveData schema, falling back to Vuex store data`);
        return;
      }

      const schema = makeSchema(JSON.parse(JSON.stringify(Module.info.saveData)));
      const validate = ajv.compile(schema);

      const copiedModule = JSON.parse(JSON.stringify(Module));
      const validated = validate(copiedModule);
      if (!validated) {
        console.error(
          `generatePreset: Module ${Module.info.name} failed saveData validation, skipping`,
          validate.errors,
        );
        return;
      }

      // Merge validated data onto existing data
      moduleData[moduleName].values = Object.assign(moduleData[moduleName].values, copiedModule);
    });

    return moduleData;
  },
  setActiveModuleControlValue({ commit }, { moduleName, variable, value }) {
    const module = externalState.active[moduleName];
    const controlValues = state.active[moduleName];
    let processedValue = value.valueOf();

    store.getters['plugins/enabledPlugins']
    .filter(plugin => ('processValue' in plugin.plugin))
    .forEach((plugin) => {
      const newValue = plugin.plugin.processValue({
        currentValue: processedValue,
        controlVariable: variable,
        delta: modV.delta,
        moduleName,
      });

      if (newValue) processedValue = newValue;
    });

    if (
      Object.keys(controlValues)
        .filter(controlVariableName => controlVariableName === variable).length < 1
    ) {
      return;
    }

    if ('append' in module.info.controls[variable]) {
      processedValue = `${processedValue}${module.info.controls[variable].append}`;
    }

    commit('setActiveModuleControlValue', { moduleName, variable, value, processedValue });
  },
};

// mutations
const mutations = {
  addModuleToRegistry(state, { Module, moduleName }) {
    Vue.set(state.registry, moduleName, Module);
  },
  removeModuleFromRegistry(state, { moduleName }) {
    Vue.delete(state.registry, moduleName);
  },
  addActiveModule(state, { module, moduleName }) {
    const values = {};

    Object.keys(module.info.controls).forEach((controlVariableName) => {
      values[controlVariableName] = module[controlVariableName];
    });

    Vue.set(state.active, moduleName, values);
    Vue.set(state.active[moduleName], 'info', {});
    externalState.active[moduleName] = module;
  },
  setActiveModuleControlValue(state, { moduleName, variable, value, processedValue }) {
    Vue.set(state.active[moduleName], variable, value);
    externalState.active[moduleName][variable] = processedValue;
  },
  removeActiveModule(state, { moduleName }) {
    Vue.delete(state.active, moduleName);
    delete externalState.active[moduleName];
  },
  setModuleFocus(state, { activeModuleName }) {
    state.focusedModule = activeModuleName;
  },
  setCurrentDragged(state, { moduleName }) {
    state.currentDragged = moduleName;
  },
  setActiveModuleAlpha(state, { moduleName, alpha }) {
    Vue.set(state.active[moduleName].info, 'alpha', alpha);
    externalState.active[moduleName].info.alpha = alpha;
  },
  setActiveModuleEnabled(state, { moduleName, enabled }) {
    Vue.set(state.active[moduleName].info, 'enabled', enabled);
    externalState.active[moduleName].info.enabled = enabled;
  },
  setActiveModuleCompositeOperation(state, { moduleName, compositeOperation }) {
    Vue.set(state.active[moduleName].info, 'compositeOperation', compositeOperation);
    externalState.active[moduleName].info.compositeOperation = compositeOperation;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
