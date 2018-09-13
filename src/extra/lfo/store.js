import LFO from 'lfo-for-modv';
import Vue from 'vue';
import store from '@/../store';
import modvVue from '@/main';
import { ModalProgrammatic } from 'buefy';
import LFOEditor from './LFOEditor';

const state = {
  assignments: {},
  visible: false,
  activeControlData: {
    moduleName: '',
    controlVariable: '',
  },
};

const getters = {
  assignments: state => state.assignments,
  activeControlData: state => state.activeControlData,
  assignment: state => ({ moduleName, controlVariable }) => {
    if (!state.assignments[moduleName]) return false;
    return state.assignments[moduleName][controlVariable];
  },
};

const actions = {
  addAssignment({ commit }, {
    moduleName,
    controlVariable,
    group,
    groupName,
    waveform,
    frequency,
  }) {
    const Module = store.state.modVModules.active[moduleName];
    if (!Module) return;
    if (typeof Module.props[controlVariable] === 'undefined') return;

    const controller = new LFO({
      waveform,
      freq: frequency,
    });

    const assignment = {
      moduleName,
      controlVariable,
      group,
      groupName,
      controller,
      waveform,
      useBpm: true,
    };

    commit('addAssignment', { assignment });
  },
  setActiveControlData({ commit }, { moduleName, controlVariable }) {
    ModalProgrammatic.open({
      parent: modvVue,
      component: LFOEditor,
      hasModalCard: true,
    });
    commit('setActiveControlData', { moduleName, controlVariable });
  },
  updateBpmFrequency({ commit, state }, { frequency }) {
    Object.keys(state.assignments).forEach((assignmentKey) => {
      const moduleAssignment = state.assignments[assignmentKey];

      Object.keys(moduleAssignment).forEach((moduleAssignmentKey) => {
        const variableAssignment = state.assignments[assignmentKey][moduleAssignmentKey];
        if (variableAssignment.useBpm) {
          commit('setLfoFrequency', {
            moduleName: assignmentKey,
            controlVariable: moduleAssignmentKey,
            frequency,
          });
        }
      });
    });
  },
};

const mutations = {
  addAssignment(state, { assignment }) {
    if (!state.assignments[assignment.moduleName]) {
      Vue.set(state.assignments, assignment.moduleName, {});
    }

    Vue.set(state.assignments[assignment.moduleName], assignment.controlVariable, assignment);
  },
  setLfoFunction(state, { moduleName, controlVariable, expressionFunction }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    Vue.set(state.assignments[moduleName][controlVariable], 'waveform', expressionFunction);

    state.assignments[moduleName][controlVariable].controller.set({
      waveform: expressionFunction,
    });
  },
  setLfoFrequency(state, { moduleName, controlVariable, frequency }) {
    if (!state.assignments[moduleName][controlVariable]) return;

    Vue.set(state.assignments[moduleName][controlVariable], 'freq', frequency);

    state.assignments[moduleName][controlVariable].controller.set({
      freq: frequency,
    });
  },
  setUseBpm(state, { moduleName, controlVariable, useBpm }) {
    Vue.set(state.assignments[moduleName][controlVariable], 'useBpm', useBpm);
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
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
