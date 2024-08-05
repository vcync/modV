const state = {
  feature: {
    moduleId: ["prop"],
  },
};

const mutations = {
  ADD_FEATURE_ASSIGNMENT(state, { moduleId, prop, feature }) {
    if (!state[feature]) {
      state[feature] = {};
    }

    if (!state[feature][moduleId]) {
      state[feature][moduleId] = [];
    }

    state[feature][moduleId].push(prop);
  },

  REMOVE_FEATURE_ASSIGNMENT(state, { moduleId, prop, feature }) {
    if (!state[feature] || !state[feature][moduleId]) {
      return;
    }

    const index = state[feature][moduleId].indexOf(prop);
    if (index > -1) {
      state[feature][moduleId].splice(index, 1);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
