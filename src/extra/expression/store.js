import Vue from 'vue';
import store from '@/../store';
import math from 'mathjs';
import modvVue from '@/main';
import { ModalProgrammatic } from 'buefy';
import ExpressionComponent from './ExpressionInput';

const state = {
  // menus: {},
  assignments: {},
  visible: false,
  activeControlData: {
    moduleName: '',
    controlVariable: '',
  },
  delta: 0,
};

// getters
const getters = {
  assignments: state => state.assignments,
  activeControlData: state => state.activeControlData,
  assignment: state => (moduleName, controlVariable) => {
    if (!state.assignments[moduleName]) return false;
    return state.assignments[moduleName][controlVariable];
  },
  delta: state => state.delta,
  // menu: state => id => state.menus[id],
  // activeMenus: state => state.activeMenus.map(id => state.menus[id])
};

function compileExpression(expression, additionalScope = {}) {
  const scope = { value: 0, delta: 0, map: window.Math.map };

  Object.keys(additionalScope).forEach((key) => {
    scope[key] = additionalScope[key];
  });

  // provide a scope
  let newFunction;
  try {
    const node = math.parse(expression, scope);

    newFunction = node.compile();
    newFunction.eval(scope);
  } catch (e) {
    return false;
  }

  return newFunction;
}

// actions
const actions = {
  addExpression({ commit }, { expression, moduleName, controlVariable, scopeAdditions }) {
    const Module = store.getters['modVModules/getActiveModule'](moduleName);
    if (!Module) return;
    if (typeof Module.info.controls[controlVariable] === 'undefined') return;

    let additionalScope = {};
    const existingModuleAssignment = state.assignments[moduleName];
    if (existingModuleAssignment) {
      if (controlVariable in existingModuleAssignment) {
        additionalScope = existingModuleAssignment[controlVariable].additionalScope;
      }
    }

    if (scopeAdditions) {
      Object.keys(scopeAdditions).forEach((key) => {
        additionalScope[key] = eval(`(${scopeAdditions[key]})`); //eslint-disable-line
      });
    }

    let exp = expression;
    if (!exp) exp = 'value';

    const func = compileExpression(exp, additionalScope);
    if (!func) return;

    const assignment = {
      func,
      expression: exp,
      additionalScope,
      moduleName,
      controlVariable,
    };

    commit('addExpression', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    commit('setActiveControlData', { moduleName, controlVariable });

    ModalProgrammatic.open({
      parent: modvVue,
      component: ExpressionComponent,
      hasModalCard: true,
    });
  },
  addToScope({ commit, dispatch }, { moduleName, controlVariable, scopeAdditions }) {
    const assignmentModule = state.assignments[moduleName];
    if (!assignmentModule) dispatch('addExpression', { moduleName, controlVariable });

    const assignmentVariable = state.assignments[moduleName][controlVariable];
    if (!assignmentVariable) dispatch('addExpression', { moduleName, controlVariable });

    commit('addToScope', { moduleName, controlVariable, scopeAdditions });

    const expression = state.assignments[moduleName][controlVariable].expression;
    const additionalScope = state.assignments[moduleName][controlVariable].additionalScope;
    const expressionFunction = compileExpression(expression, additionalScope);
    if (!expressionFunction) return;
    commit('setExpressionFunction', { moduleName, controlVariable, expressionFunction });
  },
};

// mutations
const mutations = {
  addExpression(state, { assignment }) {
    if (!state.assignments[assignment.moduleName]) {
      Vue.set(state.assignments, assignment.moduleName, {});
    }

    Vue.set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  addToScope(state, { moduleName, controlVariable, scopeAdditions }) {
    const additionalScope = state.assignments[moduleName][controlVariable].additionalScope || {};
    Object.keys(scopeAdditions).forEach((key) => {
      additionalScope[key] = eval(`(${scopeAdditions[key]})`); //eslint-disable-line
    });

    Vue.set(state.assignments[moduleName][controlVariable], 'additionalScope', additionalScope);
  },
  setExpressionFunction(state, { moduleName, controlVariable, expressionFunction }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    Vue.set(state.assignments[moduleName][controlVariable], 'func', expressionFunction);
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
  },
  setDelta(state, { delta }) {
    Vue.set(state, 'delta', delta);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
