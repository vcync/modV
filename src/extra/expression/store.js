import Vue from 'vue';
import store from '@/../store';
import math from 'mathjs';
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

function compileExpression(expression) {
  const scope = { value: 0, delta: 0, map: window.math.map };
  // provide a scope
  const node = math.parse(expression, scope);
  const newFunction = node.compile();
  try {
    newFunction.eval(scope);
  } catch(e) {
    console.error(e);
    return false;
  }

  return newFunction;
}

// actions
const actions = {
  addExpression({ commit }, { expression, moduleName, controlVariable }) {
    const Module = store.getters['modVModules/getActiveModule'](moduleName);
    if(!Module) return;
    if(typeof Module.info.controls[controlVariable] === 'undefined') return;

    let exp = expression;
    if(!exp) exp = 'value';

    const func = compileExpression(exp);
    if(!func) return;

    const assignment = {
      func,
      expression: exp,
      moduleName,
      controlVariable
    };

    commit('addExpression', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    modvVue.$modal.show('expression-input');
    commit('setActiveControlData', { moduleName, controlVariable });
  }
};

// mutations
const mutations = {
  addExpression(state, { assignment }) {
    if(!state.assignments[assignment.moduleName]) {
      Vue.set(state.assignments, assignment.moduleName, {});
    }

    Vue.set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  removeExpression(state, { moduleName, controlVariable }) {
    Vue.delete(state.assignments[moduleName], controlVariable);
  },
  removeExpressions(state, { moduleName }) {
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