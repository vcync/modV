import Vue from "vue";

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
  },

  createPresetData() {
    return state;
  },

  async loadPresetData({ commit }, newState) {
    commit("SET_STATE", newState);
    return;
  }
};

const mutations = {
  ADD_DEVICE(state, { id, name, manufacturer }) {
    Vue.set(state.devices, `${id}-${name}-${manufacturer}`, {
      id,
      name,
      manufacturer,
      channelData: {},
      listenForInput: true,
      listenForClock: false,
      ccAsNoteOn: false
    });
  },

  UPDATE_DEVICE(state, { id, key, value }) {
    Vue.set(state.devices[id], key, value);
  },

  WRITE_DATA(state, { id, channel, type, data }) {
    if (!state.devices[id].channelData[channel]) {
      Vue.set(state.devices[id].channelData, channel, {});
    }

    Vue.set(state.devices[id].channelData[channel], type, data);
  },

  SET_LEARNING(state, value) {
    Vue.set(state, "learning", value);
  },

  SET_STATE(state, newState) {
    state = { ...newState };
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
