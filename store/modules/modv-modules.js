import Vue from 'vue';
import { modV } from '@/modv';
import store from '../index';

const externalState = {
  active: {}
};

const state = {
  active: {},
  registry: {},
  focusedModule: null
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
  getActiveModule: () => moduleName => externalState.active[moduleName]
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
    const useDpr = store.getters['size/useRetina'];

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
    commit('addActiveModule', { module, moduleName: newModuleName });
    return module;
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
    delete state.registry[moduleName];
  },
  addActiveModule(state, { module, moduleName }) {
    Vue.set(state.active, moduleName, moduleName);
    externalState.active[moduleName] = module;
  },
  removeActiveModule(state, { moduleName }) {
    delete state.active[moduleName];
    delete externalState.active[moduleName];
  },
  setModuleFocus(state, { activeModuleName }) {
    state.focusedModule = activeModuleName;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};