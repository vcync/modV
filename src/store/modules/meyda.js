import store from '../index';

const state = {
  features: ['complexSpectrum'],
  controlAssignments: [],
};

// getters
const getters = {
  features: state => state.features,
  controlAssignments: state => state.controlAssignments,
  assignment: state => (moduleName) => {
    const assignmentsToModule = state.controlAssignments
      .filter(assignment => assignment.moduleName === moduleName);

    if (assignmentsToModule.length === 0) return false;
    return assignmentsToModule;
  },
};

// actions
const actions = {

};

// mutations
const mutations = {
  addFeature(state, { feature }) {
    if (state.features.find(element => element === feature)) return;
    state.features.push(feature);
  },
  removeFeature(state, { feature }) {
    const index = state.features.findIndex(element => element === feature);
    if (index < 0) return;
    state.features.splice(index, 1);
  },
  assignFeatureToControl(state, { feature, moduleName, controlVariable }) {
    const Module = store.state.modVModules.active[moduleName];
    if (!Module) return;
    if (typeof Module.props[controlVariable] === 'undefined') return;

    const assignment = {
      feature,
      moduleName,
      controlVariable,
    };

    if (state.features.indexOf(feature) < 0) state.features.push(feature);
    state.controlAssignments.push(assignment);
  },
  removeAssignments(state, { moduleName }) {
    state.controlAssignments = state.controlAssignments
      .filter(assignment => assignment.moduleName !== moduleName);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
