import Vue from 'vue';
import { modV } from '@/modv';
import store from '../index';

const externalState = {
  active: {}
};

const state = {
  active: {},
  registry: {},
  focusedModule: null,
  currentDragged: null
};

function generateName(name) {
  let dupeNo = 1;

  if(name in state.active) {
    let dupeName = `${name} (${dupeNo})`;
    while(dupeName in state.active) {
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
  getValueFromActiveModule: state => (moduleName, controlVariable) => ({ raw: state.active[moduleName][controlVariable], processed: externalState.active[moduleName][controlVariable] })
};

// actions
const actions = {
  createActiveModule({ commit, state }, { moduleName, appendToName, skipInit }) {
    const module = new state.registry[moduleName]();
    let newModuleName = generateName(module.info.name);
    module.info.name = newModuleName;
    module.info.alpha = 1;
    module.info.originalName = moduleName;
    module.info.enabled = true;
    module.info.compositeOperation = 'normal';

    const dimensions = store.getters['size/dimensions'];
    const useDpr = store.getters['user/useRetina'];

    if(useDpr) {
      dimensions.width *= window.devicePixelRatio;
      dimensions.height *= window.devicePixelRatio;
    }

    const canvas = modV.bufferCanvas;

    if('init' in module && !skipInit) module.init(canvas);

    if('meyda' in module.info) {
      if(Array.isArray(module.info.meyda)) {
        module.info.meyda.forEach(feature =>
          store.commit('meyda/addFeature', { feature })
        );
      }
    }

    newModuleName = `${newModuleName}${appendToName || ''}`;

    if('controls' in module.info) {
      Object.keys(module.info.controls).forEach((key) => {
        const control = module.info.controls[key];
        const inputId = `${newModuleName}-${control.variable}`;

        if(control.type === 'paletteControl') {
          store.dispatch('palettes/createPalette', {
            id: inputId,
            colors: control.colors || [],
            duration: control.timePeriod,
            moduleName: newModuleName,
            variable: control.variable
          });
        }
      });
    }

    commit('addActiveModule', { module, moduleName: newModuleName });
    return module;
  },
  removeActiveModule({ commit }, { moduleName }) {
    const Module = externalState.active[moduleName];

    if(state.focusedModule === moduleName) {
      commit('setModuleFocus', { activeModuleName: null });
    }

    if('controls' in Module.info) {
      Object.keys(Module.info.controls).forEach((key) => {
        const control = Module.info.controls[key];
        const inputId = `${moduleName}-${control.variable}`;

        if(control.type === 'paletteControl') {
          store.dispatch('palettes/removePalette', {
            id: inputId
          });
        }
      });
    }

    commit('removeActiveModule', { moduleName });
  },
  register({ commit, state }, { Module }) {
    const instantiated = new Module();
    const moduleName = instantiated.info.name;
    commit('addModuleToRegistry', { Module, moduleName });
  },
  resizeActive({ state }) {
    const canvas = modV.bufferCanvas;
    Object.keys(state.active).forEach((moduleName) => {
      let module;

      if(moduleName.indexOf('-gallery') > -1) return;

      if(moduleName in externalState.active) {
        module = externalState.active[moduleName];
      } else {
        return;
      }

      if('resize' in module) {
        module.resize(canvas);
      }
    });
  }
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
    externalState.active[moduleName] = module;
  },
  setActiveModuleControlValue(state, { moduleName, variable, value }) {
    const controlValues = state.active[moduleName];
    let processedValue = value;

    modV.plugins.filter(plugin => ('processValue' in plugin)).forEach((plugin) => {
      processedValue = plugin.processValue({
        currentValue: value,
        controlVariable: variable,
        moduleName
      });
    });

    if(
      Object.keys(controlValues)
        .filter(controlVariableName => controlVariableName === variable).length < 1
      ) {
      return;
    }

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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};