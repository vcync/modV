import LFO from 'lfo-for-modv';
import Vue from 'vue';
import store from '@/../store';
import modvVue from '@/main';

const state = {
  // menus: {},
  assignments: {},
  visible: false,
  activeControlData: {
    moduleName: '',
    controlVariable: ''
  }
};

// getters
const getters = {
  assignments: state => state.assignments,
  activeControlData: state => state.activeControlData,
  assignment: state => (moduleName, controlVariable) => {
    if(!state.assignments[moduleName]) return false;
    return state.assignments[moduleName][controlVariable];
  }
  // menu: state => id => state.menus[id],
  // activeMenus: state => state.activeMenus.map(id => state.menus[id])
};

// actions
const actions = {
  addAssignment({ commit }, { moduleName, controlVariable, waveform, frequency }) {
    const Module = store.getters['modVModules/getActiveModule'](moduleName);
    if(!Module) return;
    if(typeof Module.info.controls[controlVariable] === 'undefined') return;

    const controller = new LFO({
      waveform,
      freq: frequency
    });

    const assignment = {
      moduleName,
      controlVariable,
      controller
    };

    commit('addAssignment', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    modvVue.$modal.show('expression-input');
    commit('setActiveControlData', { moduleName, controlVariable });
  }
};

// mutations
const mutations = {
  addAssignment(state, { assignment }) {
    if(!state.assignments[assignment.moduleName]) {
      Vue.set(state.assignments, assignment.moduleName, {});
    }

    Vue.set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  setLfoFunction(state, { moduleName, controlVariable, expressionFunction }) {
    if(!state.assignments[moduleName][controlVariable]) return;

    Vue.set(state.assignments[moduleName][controlVariable], 'func', expressionFunction);
  },
  removeAssignment(state, { moduleName, controlVariable }) {
    Vue.delete(state.assignments[moduleName], controlVariable);
  },
  removeAssignments(state, { moduleName }) {
    Vue.delete(state.assignments, moduleName);
  },
  setActiveControlData(state, { moduleName, controlVariable }) {
    Vue.set(state.activeControlData, 'moduleName', moduleName);
    Vue.set(state.activeControlData, 'controlVariable', controlVariable);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};