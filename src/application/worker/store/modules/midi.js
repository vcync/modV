const state = {
  devices: {},
  learning: false
};

const actions = {
  learn({ commit }) {
    let resolve;
    const promise = new Promise(r => {
      resolve = message => {
        commit("SET_LEARNING", false);
        r(message);
      };
    });

    commit("SET_LEARNING", resolve);
    return promise;
  }
};

const mutations = {
  ADD_DEVICE(state, { id, name, manufacturer }) {
    state.devices[`${id}-${name}-${manufacturer}`] = {
      id,
      name,
      manufacturer,
      channelData: {}
    };
  },

  WRITE_DATA(state, { id, channel, type, data }) {
    if (!state.devices[id].channelData[channel]) {
      state.devices[id].channelData[channel] = {};
    }

    state.devices[id].channelData[channel][type] = data;
  },

  SET_LEARNING(state, value) {
    state.learning = value;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
